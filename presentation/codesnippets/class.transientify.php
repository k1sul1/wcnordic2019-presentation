<?php
namespace OM\TM;

/**
 * Better API for Transients API.
 *
 * Totally not threadsafe.
 */
class Transientify {
  const DEFAULT_EXPIRY = 30;
  const BYPASS_KEY = "WHATEVER_YOU_WANT";

  public $expiry;
  public $bypass;
  public $key;

  public function __construct(string $key = null, array $options = []) {
    if (is_null($key)) {
      throw new \Exception('Transient key is required');
    }

    $user = wp_get_current_user();
    $accessLevel = ($user && $user->ID)
      ? \AsteikkoAuth::userGetAccessLevel($user)
      : 0;


    $this->key = "omf_{$accessLevel}_{$key}";

    $this->parseOptions($options);
  }

  public static function getPrefetchList() {
    // Value possibly grows high
    return get_option('omf_transient_prefetch', []);
  }

  public static function getTransientList() {
    // Value size grows high if dynamic transients are used, avoid storing in DB
    return get_option('omf_transient_list', []);
  }

  /**
   * If performance becomes a problem (it shouldn't), implement a whitelist instead
   *
   * @param string $role
   */
  public function userCan(string $role) {
    return current_user_can($role);
  }

  public function parseOptions(array $options = []) {
    $options = array_merge([
      "expiry" => self::DEFAULT_EXPIRY,
      "bypassPermissions" => ["edit_posts"], // Allow anyone with the right to edit posts to bypass the transient
      "prefetch" => false, // Set to a string to schedule prefetching for transient
      "subkey" => null, // Allow storing multiple values under same transient
      "meta" => [], // For providing meta from creation
    ], $options);

    $this->expiry = $options["expiry"];
    $this->subkey = $options["subkey"];
    $this->bypass = (!empty($_GET["bypass"]) && $_GET['bypass'] === self::BYPASS_KEY) ||
      !empty(array_filter($options["bypassPermissions"], [$this, 'userCan'])) ? true : false;

    $storedAt = date('U');
    $this->meta = array_merge($options["meta"], [
      "expiry" => $this->expiry,
      "storedAt" => date('Y-m-d H:i:s', $storedAt),
      "invalidAt" => date('Y-m-d H:i:s', $storedAt + $this->expiry),
    ]);

    if ($options["prefetch"]) {
      $list = self::getPrefetchList();
      $existsInList = !empty($list[$options["prefetch"]]);

      if (!$existsInList) {
        $x = time() + $this->expiry - 30; // Prefetch transient 30 seconds before it expires
        $list[$options["prefetch"]] = $x;

        update_option('omf_transient_prefetch', $list, true);
        wp_schedule_single_event($x, 'omf_prefetch_transient', [$options["prefetch"]]);
      }
    }
  }

  /**
   * Send a request to the URL that is supposed to populate transient
   *
   * @param mixed $url
   */
  static function prefetch($url) {
    $key = static::$bypassKey;
    $list = self::getPrefetchList();

    if (!empty($list[$url])) {
      unset($list[$url]);
      update_option('omf_transient_prefetch', $list, true);

      $url = $url . (strpos($url, "?") > -1 ? "&" : "?") . "bypass={$key}";
      return wp_remote_get($url, [
        "blocking" => false,
        "timeout" => 60,
        "user-agent" => "Transient-Prefetcher",
      ]);
    }

    throw new \Exception("Tried to prefetch something not marked as prefetchable: $url");
  }

  public function clear($key = null) { // This should probably be a static method instead; it doesn't *really* require $this
    $transientList = self::getTransientList();
    $key = $key ?? $this->key;

    unset($transientList[$key]);
    update_option("omf_transient_list", $transientList, true);

    return delete_transient($key ?? $this->key);
  }

  public function get(callable $getData) {
    if (!$this->bypass) {
      $transient = get_transient($this->key);

      if ($this->subkey) {
        $transient = $transient[$this->subkey] ?? false;
      }

      if ($transient !== false) {
        return $transient;
      }
    }

    return $getData($this);
  }

  public function set($data) {
    $transientList = self::getTransientList();

    if ($this->subkey) {
      $current = $transientList[$this->key] ?? [
        "storesMultiple" => 1,
        "subtransients" => [],
      ];
      $transientList[$this->key] = array_merge(
        $current,
        [
          "subtransients" => array_merge($current["subtransients"], [
            $this->subkey => $this->meta
          ])
        ]
      );

      $data = [
        $this->subkey => $data
      ];
    } else {
      $transientList[$this->key] = array_merge(
        $this->meta,
        [
          "storesMultiple" => 0,
        ]
      );
    }

    update_option("omf_transient_list", $transientList, false);
    set_transient($this->key, $data, $this->expiry);


    if ($this->subkey) {
      // Get rid of the extra layer
      return $data[$this->subkey];
    } else {
      return $data;
    }
  }
}

// Exists because the evolution of the class
function transientify(string $key = null, array $options = []) {
  $transientifier = new Transientify($key, $options);

  return $transientifier;
}

// Cronjob triggers this action
add_action('omf_prefetch_transient', ['\OM\TM\Transientify', 'prefetch']);

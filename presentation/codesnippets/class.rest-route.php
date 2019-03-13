<?php
namespace OM\TM;

/**
 * Base class for creating routes to the API. Abstract so it can't be instantiated.
 */
abstract class RestRoute extends \WP_REST_Controller {
  protected $namespace;
  protected $route;
  public $routes = [];

  public function __construct(string $namespace, string $route) {
    $this->setNamespace($namespace);
    $this->setRouteBase($route);

    // $this->register_routes(); // Call in extending class constructor after createEndpoint calls
  }

  public function setNamespace(string $namespace) {
    $this->namespace = $namespace;
  }

  public function setRouteBase(string $route) {
    $this->route = $route;
  }

  /**
   * Create an endpoint under the current route, optionally store the response in object cache
   * using \OM\TM\Transientify.
   */
  public function createEndpoint(string $path, array $params = [], array $cache = []) {
    if (empty($params)) {
      throw new \Exception('Cannot create route without route params');
    } else if (isset($params["get_callback"])) {
      throw new \Exception('Param get_callback is unsupported, use callback instead');
    }

    /**
     * If $cache is set, store the response. Storage time depends on options provided.
     * Hackish. Sorry.
     */
    if (!empty($cache)) {
      $cb = $params["callback"]; // Store a reference to the callback before overwriting it
      $route = $this->route;
      $namespace = $this->namespace;

      /**
       * Overwrite the callback param with a new closure. This is done because there's no way to
       * gain access to $request in $transientifier context. Variables $cb & $transientifier are
       * passed by reference to avoid making copies of them and using more memory.
       */
      $params["callback"] = function($request) use (&$cb, $route, $namespace, $path, $cache) {
        $reqParams = $request->get_params();
        $cache = array_merge(
          [
            "subkey" => md5(json_encode($reqParams)), // Store multiple transients under same key, select the correct transient with subkey
            "meta" => [
              "params" => http_build_query($reqParams),
            ],
          ],
          $cache
        );

        // Note: Memcached's max key length is 250 chars
        // Note: set_transient() max key length is 172 chars
        // Note: $path is empty in "root" endpoints
        $key = "{$namespace}_{$route}_{$path}_" . md5(json_encode($reqParams));

        $transientifier = transientify($key, $cache);

        $data = $transientifier
          ->get(function($transientify) use (&$cb, &$request) {
            // If there's nothing cached, run the original API callback and cache it.
            $response = $cb($request);

            if (!is_wp_error($response)) {
              return $transientify->set($response);
            }
            else {
              return $response;
            }
          });

        // Turn $data into a WP_REST_Response, but only if it isn't a WP_REST_Response already
        $response = rest_ensure_response($data);

        return $response;
      };
    }

    $this->routes[$path] = $params;
  }

  /**
   * Loop all created endpoints and register them with register_rest_route
   */
  public function register_routes() {
    foreach ($this->routes as $path => $params) {
      register_rest_route($this->namespace, $this->route . $path, $params);
    }
  }
}

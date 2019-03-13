<?php
namespace OM\TM\REST\Routes;

class Category extends \OM\TM\RestRoute {
  public function __construct() {
    parent::__construct("om/v1", "category");

    $this->createEndpoint(
      "/(?P<id>[\d]+)",
      [
        "methods" => \WP_REST_Server::READABLE,
        "callback" => [$this, "rootRoute"]
      ],
      [
        "expiry" => 900, // 15min
      ]
    );

    $this->register_routes();
  }

  public function rootRoute($request) {
    $params = $request->get_url_params();
    $id = (int) ($params['id'] ?? false);

    $highlights = get_field('highlights', "term_$id");
    $highlights =  \OM\TM\Utils\MVPItemConversion\convert_items_to_posts($highlights, $id);
    $editorialPicks = get_field('editorialPicks', "term_$id") ?: [];

    foreach ($editorialPicks as $k => $pick) {
      $editorialPicks[$k] = \OM\TM\REST\Helpers\get_post_from_api($pick);
    }

    $data = compact("highlights", "editorialPicks");

    return $data;
  }
}
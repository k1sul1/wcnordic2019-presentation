<?php

namespace OM\TM\REST\Filters;

function digimag_query_params($ts = null) {
  $ts = $ts ?? \current_time('U');
  return [
    'meta_query' => [
      'relation' => 'AND',
      'publish_date' => [
        'key' => 'publish_date',
        'type' => 'DATETIME',
        'compare' => '<=',
        'value' => date('Y-m-d H:i:s', $ts),
      ],
    ],
    'order' => 'DESC',
    'orderby' => 'meta_value',
  ];
}

function change_digimag_url($menu) {
  foreach ($menu["items"] as $k => $v) {
    if ($v["title"] === 'Digilehti') {
      $terms = get_terms(array_merge([
        'hide_empty' => false,
        'taxonomy' => 'printmag',
        'number' => 1,
      ], digimag_query_params()));

      if (!empty($terms)) {
        $menu["items"][$k] = array_merge($v, [
          "object_id" => $terms[0]->term_id,
          "url" => get_term_link($terms[0]),
        ]);
      }
    }
  }

  return $menu;
}

function order_printmag_by_pubdate($query) {
  return array_merge($query, digimag_query_params(strtotime("+ 6 week")));
}

function remove_unwanted_values($response, $term, $request) {
  // Clear `layout` because it's unprocessed and bloated
  $response->data['acf']['layout'] = get_site_url() . "/wp-json/om/v1/digimag/{$term->name}";

  return $response;
}


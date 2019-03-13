<?php

/**
 * Mostly used for rendering certain custom shortcodes differently
 */
function isREST() {
  return defined('REST_REQUEST') && REST_REQUEST;
}

add_action('rest_api_init', function() {
  // Not much point in loading REST API code if API is not used
  require_once 'rest/routes.php';
  require_once 'rest/fields.php';
  require_once 'rest/filters.php';

  // Image IDs are useless on the frontend, and force another API request for each image ID.
  add_filter('acf/load_field/type=image', '\OM\TM\ACF\Filters\change_return_format_to_array');

  // Ensure that menu always contains the latest digimag issue
  add_filter('rest_menus_format_menu', '\OM\TM\REST\Filters\change_digimag_url');

  // Order digimags by date
  add_filter('rest_printmag_query', '\OM\TM\REST\Filters\order_printmag_by_pubdate');

  // Remove data used to build a digimag; useless acf flexible content
  add_filter('rest_prepare_printmag', 'OM\TM\REST\Filters\remove_unwanted_values', 10, 3);
});




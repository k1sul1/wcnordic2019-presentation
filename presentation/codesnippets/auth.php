public function authenticate($request) {
  // removed variables extracted from ENV and request to fit this code sample
  $authHeader = "Basic " . base64_encode("$clientId:$clientSecret");
  $response = wp_remote_post(get_site_url() . '/oauth/token', [
    'body' => [
      'username' => $username,
      'password' => $password,
      'grant_type' => 'password',
    ],
    'headers' => [
      'Authorization' => $authHeader,
    ],
    'timeout' => 30,
  ]);

  if (!is_wp_error($response)) {
    if ($response["response"]["code"] !== 200) {
      return new \WP_Error('oauth-response-error', json_decode($response["body"]), [
        "status" => $response["response"]["code"]
      ]);
    }

    return json_decode($response["body"]);
  } else {
    return $response;
  }
}

<?php

/**
 * RestAdapter
 *
 * A class that represents bakrypt's API and REST use cases.
 *
 * @package BakWP\api
 * @version 1.0.0
 * @since   1.0.0
 */

namespace BakWP\api;

defined('ABSPATH') || exit();

use BakWP\controllers\Post;
use BakWP\controllers\PostList;

class RestAdapter
{
    public $access_token;
    public $settings;

    function __construct()
    {
        if (!$this->settings) {
            $testnet = get_option('bakrypt_testnet_active');
            if ($testnet != 'yes') {
                $url = 'https://bakrypt.io';
                $auth_token = get_option('bakrypt_token');
            } else {
                $url = 'https://testnet.bakrypt.io';
                $auth_token = get_option(
                    'bakrypt_testnet_token'
                );
            }

            $this->settings = [
                'url' => $url,
                'testnet' => $testnet,
                'auth_token' => $auth_token,
            ];
        }
    }

    public function generate_access_token()
    {
        // Token authentication if auth token is found.
        if ($this->settings['auth_token']) {
            $response = wp_remote_post(
                $this->settings['url'] . '/auth/access_token/',
                [
                    'method' => 'POST',
                    'timeout' => 30,
                    'redirection' => 5,
                    'httpversion' => '1.0',
                    'blocking' => true,
                    'headers' => [
                        'content-type' => 'application/json',
                        'authorization' =>
                        'token ' . $this->settings['auth_token'],
                    ],
                ]
            );
        } else {
            $response = wp_remote_post(
                $this->settings['url'] . '/auth/token/',
                [
                    'method' => 'POST',
                    'timeout' => 30,
                    'redirection' => 5,
                    'httpversion' => '1.0',
                    'blocking' => true,
                    'headers' => [
                        'content-type' => 'application/x-www-form-urlencoded',
                    ],
                    'body' => http_build_query([
                        'client_id' => $this->settings['client_id'],
                        'client_secret' => $this->settings['client_secret'],
                        'username' => $this->settings['username'],
                        'password' => $this->settings['password'],
                        'grant_type' => 'password',
                    ]),
                ]
            );
        }

        $access = [];
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            echo 'Something went wrong:' . esc_html($error_message);
        } else {
            $access = json_decode($response['body']);
        }

        # Set access token
        $this->access_token = $access;

        return $access;
    }

    public function upload_attachment_to_ipfs($attachment_id)
    {
        if (!$this->access_token) {
            $this->generate_access_token();
        }

        $token = $this->access_token;

        $img_url = wp_get_attachment_url($attachment_id);
        $img_name = basename(get_attached_file($attachment_id));
        $content_type = get_post_mime_type($attachment_id);

        $boundary = wp_generate_password(24);
        $payload = '';
        // Upload the file
        $payload .= '--' . $boundary;
        $payload .= "\r\n";
        $payload .=
            'Content-Disposition: form-data; name="' .
            'file' .
            '"; filename="' .
            $img_name .
            '"' .
            "\r\n";
        if ($content_type) {
            $payload .= 'Content-Type: ' . $content_type . "\r\n";
        }
        $payload .= "\r\n";
        $payload .= file_get_contents($img_url);
        $payload .= "\r\n";

        $payload .= '--' . $boundary . '--';

        $response = wp_remote_post($this->settings['url'] . '/v1/files/', [
            'method' => 'POST',
            'timeout' => 30,
            'redirection' => 5,
            'httpversion' => '1.0',
            'blocking' => true,
            'headers' => [
                'content-type' => 'multipart/form-data; boundary=' . $boundary,
                'authorization' => 'Bearer ' . $token->{'access_token'},
            ],
            'body' => $payload,
        ]);

        $attachment = [];
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            echo 'Something went wrong: ' . esc_html($error_message);
        } else {
            $attachment = json_decode($response['body']);
        }

        return $attachment;
    }

    public function upload_attachment_to_ipfs_from_url($url)
    {
        if (!$this->access_token) {
            $this->generate_access_token();
        }

        $token = $this->access_token;

        $img_url = $url;
        $img_name = basename($url);
        $content_type = get_headers($url, 1)['Content-Type'];

        $boundary = wp_generate_password(24);
        $payload = '';
        // Upload the file
        $payload .= '--' . $boundary;
        $payload .= "\r\n";
        $payload .=
            'Content-Disposition: form-data; name="' .
            'file' .
            '"; filename="' .
            $img_name .
            '"' .
            "\r\n";
        if ($content_type) {
            $payload .= 'Content-Type: ' . $content_type . "\r\n";
        }
        $payload .= "\r\n";
        $payload .= file_get_contents($img_url);
        $payload .= "\r\n";

        $payload .= '--' . $boundary . '--';

        $response = wp_remote_post($this->settings['url'] . '/v1/files/', [
            'method' => 'POST',
            'timeout' => 30,
            'redirection' => 5,
            'httpversion' => '1.0',
            'blocking' => true,
            'headers' => [
                'content-type' => 'multipart/form-data; boundary=' . $boundary,
                'authorization' => 'Bearer ' . $token->{'access_token'},
            ],
            'body' => $payload,
        ]);

        $attachment = [];
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            echo 'Something went wrong: ' . esc_html($error_message);
        } else {
            $attachment = json_decode($response['body']);
        }

        return $attachment;
    }

    public static function fetch_ipfs_attachment($ipfs)
    {
        $url =
            'https://gateway.bakrypt.io/ipfs/' .
            str_replace('ipfs://', '', $ipfs);

        $response = wp_remote_get($url);

        $upload = null;

        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            echo 'Something went wrong: ' . esc_html($error_message);
        } else {
            $file = $response['body'];
            $upload = wp_upload_bits(
                basename(
                    str_replace('ipfs://', '', $ipfs) .
                        '.' .
                        explode('/', $response['headers']['content-type'])[1]
                ),
                null,
                $file
            );
            $upload['mime_type'] = $response['headers']['content-type'];

            if (!empty($upload['error'])) {
                return false;
            }
        }
        return $upload;
    }

    public static function insert_attachment_from_ipfs($ipfs, $post_id)
    {
        $upload = self::fetch_ipfs_attachment($ipfs);
        $att_id = null;
        if ($upload) {
            $file_path = $upload['file'];
            $file_name = basename($file_path);
            $file_type = wp_check_filetype($file_name, null);
            $attachment_title = sanitize_file_name(
                pathinfo($file_name, PATHINFO_FILENAME)
            );
            $wp_upload_dir = wp_upload_dir();

            $args = [
                'guid' => $wp_upload_dir['url'] . '/' . $file_name,
                'post_mime_type' => $file_type['type'],
                'post_status' => 'inherit',
                'post_content' => '',
                'post_title' => $attachment_title,
                'ipfs' => $ipfs,
            ];

            $att_id = wp_insert_attachment($args, $file_path, $post_id);

            // you must first include the image.php file
            // for the function wp_generate_attachment_metadata() to work
            require_once ABSPATH . 'wp-admin' . '/includes/image.php';
            $attach_data = wp_generate_attachment_metadata($att_id, $file_path);
            $attach_data['ipfs'] = $ipfs;
            wp_update_attachment_metadata($att_id, $attach_data);
        }

        return $att_id;
    }

    public function fetch_token_data($uuid)
    {
        $url = $this->settings['url'] . '/v1/assets/' . $uuid;
        $token = $this->access_token;
        $headers = [
            'Authorization' => 'Bearer ' . $token->{'access_token'},
            'Content-Type' => 'application/json',
        ];

        $args = [
            'headers' => $headers,
            'timeout' => 30, // Set timeout to 30 seconds
        ];

        $response = wp_remote_get($url, $args);

        $response_body = [];

        if (!is_wp_error($response)) {
            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = json_decode($response['body']);

            // Handle the response data
            // ...
        } else {
            $error_message = $response->get_error_message();
            echo 'Something went wrong: ' . esc_html($error_message);
        }

        return $response_body;
    }

    // REST API functions
    public static function get_post_detail($request)
    {
        $post_id = $request->get_param('id');

        if (empty($post_id)) {
            return new \WP_Error('invalid_param', 'Invalid post ID', [
                'status' => 400,
            ]);
        }

        // Check if the post exists
        $post = get_post($post_id);

        if (!$post) {
            return new \WP_Error('not_found', 'Post not found', [
                'status' => 404,
            ]);
        }

        // Get the post data here
        $post_data = Post::get_post_data($post_id);

        // Create a serializer instance
        $serializer = new \WP_REST_Response();
        $serializer->set_data($post_data);

        return $serializer;
    }

    public static function update_post_detail($request)
    {
        $post_id = $request->get_param('id');

        if (empty($post_id)) {
            return new \WP_Error('invalid_param', 'Invalid post ID', [
                'status' => 400,
            ]);
        }

        // Check if the post exists
        $post = get_post($post_id);

        if (!$post) {
            return new \WP_Error('not_found', 'Post not found', [
                'status' => 404,
            ]);
        }

        $body = $request->get_body();
        $body = json_decode($body, true);
        // Get the post data here
        $post = Post::update_record($post_id, $body);
        $post_data = Post::get_post_data($post_id);
        // Create a serializer instance
        $serializer = new \WP_REST_Response();
        $serializer->set_data($post_data);

        return $serializer;
    }

    public static function update_posts_bulk($request)
    {
        $body = $request->get_body();
        $body = json_decode($body, true);

        if (!array_key_exists('posts', $body)) {
            return new \WP_Error('invalid_param', 'Missing post ids', [
                'status' => 400,
            ]);
        }

        $response = [
            'success' => true,
            'message' => 'Updated record',
            'data' => PostList::update_posts($body['posts']),
        ];

        // Create a serializer instance
        $serializer = new \WP_REST_Response();
        $serializer->set_data($response);

        return $serializer;
    }

    public static function delete_post_token($request)
    {
        $post_id = $request->get_param('id');

        if (empty($post_id)) {
            return new \WP_Error('invalid_param', 'Invalid post ID', [
                'status' => 400,
            ]);
        }

        // Check if the post exists
        $post = get_post($post_id);

        if (!$post) {
            return new \WP_Error('not_found', 'Post not found', [
                'status' => 404,
            ]);
        }

        Post::delete_record($post_id);

        // Create a serializer instance
        $serializer = new \WP_REST_Response();
        $serializer->set_data([
            'detail' => 'Done',
        ]);

        return $serializer;
    }

    public static function fetch_access_token($request)
    {
        $self = new self();

        $access = $self->generate_access_token();

        $response = [
            'success' => true,
            'message' => 'Access Token',
            'data' => $access,
            'testnet' => $self->settings['testnet'] == 'yes' ? true : false,
        ];

        // Create a serializer instance
        $serializer = new \WP_REST_Response();
        $serializer->set_data($response);

        return $serializer;
    }

    public static function get_ipfs_images($request)
    {
        $body = $request->get_body();
        $body = json_decode($body, true);

        if (!array_key_exists('post_ids', $body)) {
            return new \WP_Error('invalid_param', 'Missing post ids', [
                'status' => 400,
            ]);
        }

        $response = [
            'success' => true,
            'message' => 'Success',
            'data' => array_map(function ($id) {
                return Post::fetch_ipfs_image($id);
            }, $body['post_ids']),
        ];

        // Create a serializer instance
        $serializer = new \WP_REST_Response();
        $serializer->set_data($response);

        return $serializer;
    }

    public static function upload_ipfs_images($request)
    {
        $body = $request->get_body();
        $body = json_decode($body, true);

        if (!array_key_exists('post_ids', $body)) {
            return new \WP_Error('invalid_param', 'Missing post ids', [
                'status' => 400,
            ]);
        }

        $response = [
            'success' => true,
            'message' => 'Success',
            'data' => array_map(function ($id) {
                return Post::upload_ipfs_image($id);
            }, $body['post_ids']),
        ];

        // Create a serializer instance
        $serializer = new \WP_REST_Response();
        $serializer->set_data($response);

        return $serializer;
    }
}

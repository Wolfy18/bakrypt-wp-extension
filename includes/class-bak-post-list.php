<?php

/**
 * Post List
 * A class which represents Post list operations and renderization.
 *
 * @package BakWP\controllers
 * @version 1.0.0
 * @since   1.0.0
 */

namespace BakWP\controllers;

defined('ABSPATH') || exit;

use BakWP\controllers\Post;

class PostList
{
	private static $adapter;

	protected function __construct()
	{
	}

	public static function bak_fingerprint_column($columns)
	{
		global $post_type;

		// Check if the current post type is "post"
		if ($post_type === 'post') {
			$columns['asset_fingerprint'] = __('Token');
		}

		return $columns;
	}

	public static function bak_fingerprint_column_data($column, $post_id)
	{

		switch ($column) {
			case 'asset_fingerprint': // This has to match to the defined column in function above
				$get_fingerprint = get_post_meta($post_id, 'bk_token_fingerprint', true);
				$get_status = get_post_meta($post_id, 'bk_token_status', true);
				if ($get_fingerprint) {
					echo "<a target='_blank' rel='nofollow' href='https://cexplorer.io/asset/" . esc_html($get_fingerprint) . "'>" . esc_html($get_fingerprint) . "</a>";
				} else {
					echo esc_html($get_status);
				}
				break;
		}
	}

	private static function bak_get_filter_options()
	{
		$options = [
			[
				'name' => 'Filter by Tokenization Status',
				'value' => '',
				'selected' => (!isset($_GET['tokenize']) || empty($_GET['tokenize'])) ? 'selected' : '',
			],
			[
				'name' => 'Tokenized',
				'value' => 'yes',
				'selected' => (isset($_GET['tokenize']) && $_GET['tokenize'] == 'yes') ? 'selected="selected"' : '',
			],
			[
				'name' => 'Non-Token',
				'value' => 'no',
				'selected' => (isset($_GET['tokenize']) && $_GET['tokenize'] == 'no') ? 'selected="selected"' : '',
			],
		];

		// html
		$output = '';
		foreach ($options as $option) {
			$output .= '<option value="' . $option['value'] . '" ' . $option['selected'] . '>' . $option['name'] . '</option>';
		}

		return $output;
	}

	public static function bak_custom_filter()
	{
		global $typenow;

		// Ensure the filter is displayed only on the desired post types
		if ($typenow == 'post') {
			$output = '<select class="token-filter dropdown_product_cat" name="tokenize">' . self::bak_get_filter_options() . '</select>';
			echo $output;
		}
	}

	public static function bak_post_filter_query($query)
	{

		if (is_admin()) {
			if (isset($_GET['tokenize']) && !empty($_GET['tokenize'])) {

				$meta_query = (array) $query->get('meta_query');

				if ($_GET['tokenize'] == "yes") {
					$meta_query[] = [
						'relation' => "AND",
						array(
							'key' => 'bk_token_fingerprint',
							'compare' => 'EXISTS',
						),
						array(
							'key' => 'bk_token_fingerprint',
							'compare' => '!=',
							"value" => ""
						)

					];
				} else {
					$meta_query[] = [
						'relation' => "OR",
						array(
							'key' => 'bk_token_fingerprint',
							'compare' => "NOT EXISTS",
						),
						array(
							'key' => 'bk_token_fingerprint',
							'compare' => "=",
							'value' => ""
						)

					];
				}


				$query->set('meta_query', $meta_query);
			}
		}
	}

	public static function add_mint_bulk_action($actions)
	{
		$actions['mint'] = 'Mint as Tokens';
		return $actions;
	}


	public static function update_posts($posts)
	{
		$func = function ($post) {

			$data = array(
				'bk_token_uuid' => $post['uuid'],
				'bk_token_asset_name' => $post['asset_name'],
				'bk_token_name' => $post['name'],
				'bk_token_image' => $post['image'],
				'bk_token_amount' => $post['amount'],
				'bk_token_status' => $post['status'],
				'bk_token_transaction' => $post['transaction'],
				'bk_att_token_image' => $post['image'],
			);

			return Post::update_record($post["post_id"], $data);
		};

		return array_map($func, $posts);
	}
}

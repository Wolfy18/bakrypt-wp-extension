<?php

/**
 * Settings
 *
 * A class that represents blockchain settings.
 *
 * @package BakExtension\core
 * @version 1.0.0
 * @since   1.0.0
 */

namespace BakExtension\core;

defined('ABSPATH') || exit();

class Settings
{
	public static $version = 'v1';

	public static $base = 'bak';

	public static function missing_wc_notice()
	{
		/* translators: %s WC download URL link. */
		echo '<div class="error"><p><strong>' .
			sprintf(
				esc_html__(
					'WC Blockchain Extension requires WooCommerce to be installed and active. You can download %s here.',
					'woocommerce-blockchain-extension'
				),
				'<a href="https://woocommerce.com/" target="_blank">WooCommerce</a>'
			) .
			'</strong></p></div>';
	}

	public static function add_bak_settings($settings_tabs)
	{
		$settings_tabs['bak_settings'] = __(
			'Blockchain',
			'bak-woocommerce-settings-tab'
		);
		return $settings_tabs;
	}

	public static function add_extension_register_script($page)
	{
		$script_path = '/build/index.js';
		$script_asset_path =
			dirname(WCBAK_PLUGIN_FILE) . '/build/index.asset.php';
		$script_asset = file_exists($script_asset_path)
			? require $script_asset_path
			: ['dependencies' => [], 'version' => filemtime($script_path)];
		$script_url = plugins_url($script_path, WCBAK_PLUGIN_FILE);

		wp_register_script(
			'bakrypt-wp-extension',
			$script_url,
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);

		wp_localize_script('bakrypt-wp-extension', 'wpApiSettings', [
			'rest' => [
				'root' => rest_get_url_prefix() . '/bak/v1/',
				'nonce' => wp_create_nonce('wp_rest'),
			],
		]);

		wp_register_style(
			'bakrypt-wp-extension',
			plugins_url('/build/index.css', WCBAK_PLUGIN_FILE),
			// Add any dependencies styles may have, such as wp-components.
			[],
			filemtime(dirname(WCBAK_PLUGIN_FILE) . '/build/index.css')
		);

		wp_enqueue_script('bakrypt-wp-extension');
		wp_enqueue_style('bakrypt-wp-extension');

		if ($page == 'post.php') {
			// Enqueue WordPress media scripts
			wp_enqueue_media();
		}
	}

	private static function fetch_bak_settings()
	{
		$settings = [
			'section_title' => [
				'name' => __(
					'Bakrypt API Credentials',
					'bak-woocommerce-settings-tab'
				),
				'type' => 'title',
				'desc' => '',
				'id' => 'wc_settings_tab_demo_section_title',
			],
			'auth_token' => [
				'name' => __('Authentication Token', 'bak-woocommerce-settings-tab'),
				'type' => 'password',
				'desc' => __(
					'The token for your Bakrypt account.',
					'bak-woocommerce-settings-tab'
				),
				'id' => 'wc_settings_tab_bak_auth_token',
			],
			'testnet_auth_token' => [
				'name' => __('Testnet Authentication Token', 'bak-woocommerce-settings-tab'),
				'type' => 'password',
				'desc' => __(
					'The token for your TESTNET Bakrypt account.',
					'bak-woocommerce-settings-tab'
				),
				'id' => 'wc_settings_tab_bak_testnet_auth_token',
			],
			'testnet_active' => [
				'name' => __(
					'Is Testnet active?',
					'bak-woocommerce-settings-tab'
				),
				'type' => 'checkbox',
				'desc' => __(
					'Testnet routing is active.',
					'bak-woocommerce-settings-tab'
				),
				'id' => 'wc_settings_tab_bak_testnet_active',
			],
			'section_end' => [
				'type' => 'sectionend',
				'id' => 'wc_settings_tab_bak_section_end',
			],
		];
		return apply_filters('wc_settings_tab_bak_settings', $settings);
	}

	public static function bak_add_bak_settings()
	{
		woocommerce_admin_fields(self::fetch_bak_settings());
	}

	public static function bak_update_options_bak_settings()
	{
		woocommerce_update_options(self::fetch_bak_settings());
	}
}

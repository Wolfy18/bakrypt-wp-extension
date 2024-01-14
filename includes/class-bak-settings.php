<?php

/**
 * Settings
 *
 * A class that represents blockchain settings.
 *
 * @package BakWP\core
 * @version 1.0.0
 * @since   1.0.0
 */

namespace BakWP\core;

defined('ABSPATH') || exit();

class Settings
{
	public static $version = 'v1';

	public static $base = 'bak';

	public static function add_extension_register_script($page)
	{
		$script_path = '/build/index.js';
		$script_asset_path =
			dirname(WPBAK_PLUGIN_FILE) . '/build/index.asset.php';
		$script_asset = file_exists($script_asset_path)
			? require $script_asset_path
			: ['dependencies' => [], 'version' => filemtime($script_path)];
		$script_url = plugins_url($script_path, WPBAK_PLUGIN_FILE);

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
			plugins_url('/build/index.css', WPBAK_PLUGIN_FILE),
			// Add any dependencies styles may have, such as wp-components.
			[],
			filemtime(dirname(WPBAK_PLUGIN_FILE) . '/build/index.css')
		);

		wp_enqueue_script('bakrypt-wp-extension');
		wp_enqueue_style('bakrypt-wp-extension');

		if ($page == 'post.php') {
			// Enqueue WordPress media scripts
			wp_enqueue_media();
		}
	}

	public static function register_bak_settings()
	{
		// Register a setting for token
		register_setting('bakrypt_settings_group', 'bakrypt_token');

		// Register a setting for testnet token
		register_setting('bakrypt_settings_group', 'bakrypt_testnet_token');

		// Register a setting for testnet activation
		register_setting('bakrypt_settings_group', 'bakrypt_testnet_active');

		// Add a section for Bakrypt Settings
		add_settings_section(
			'bakrypt_settings_section',
			'Bakrypt Settings',
			'bakrypt_settings_section_callback',
			'bakrypt-settings'
		);

		// Add fields for token and testnet token
		add_settings_field(
			'bakrypt_token',
			'Token',
			self::bakrypt_token_callback(),
			'bakrypt-settings',
			'bakrypt_settings_section'
		);

		add_settings_field(
			'bakrypt_testnet_token',
			'Testnet Token',
			self::bakrypt_testnet_token_callback(),
			'bakrypt-settings',
			'bakrypt_settings_section'
		);

		// Add field for testnet activation
		add_settings_field(
			'bakrypt_testnet_active',
			'Testnet is Active',
			self::bakrypt_testnet_active_callback(),
			'bakrypt-settings',
			'bakrypt_settings_section'
		);
	}

	// Callback functions for rendering fields
	private static function bakrypt_token_callback()
	{
		$token = get_option('bakrypt_token');
		echo '<input type="text" name="bakrypt_token" value="' . esc_attr($token) . '" />';
	}

	private static function bakrypt_testnet_token_callback()
	{
		$testnetToken = get_option('bakrypt_testnet_token');
		echo '<input type="text" name="bakrypt_testnet_token" value="' . esc_attr($testnetToken) . '" />';
	}

	private static function bakrypt_testnet_active_callback()
	{
		$testnetActive = get_option('bakrypt_testnet_active');
		echo '<input type="checkbox" name="bakrypt_testnet_active" ' . checked(1, $testnetActive, false) . ' />';
	}

	private static function bakrypt_settings_section_callback()
	{
		echo '<p>Configure your Bakrypt authentication settings below:</p>';
	}
}

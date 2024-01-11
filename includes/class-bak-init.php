<?php

/**
 *
 * A class which initiates the plugin
 *
 * @package Bakrypt\Classes
 * @version 1.0.0
 * @since   1.0.0
 */

namespace BakExtension\core;

defined('ABSPATH') || exit;

class BakWPExtension
{
    /**
     * The single instance of the class.
     */
    protected static $_instance = null;

    /**
     * Constructor.
     */
    protected function __construct()
    {
        // Instantiation logic will go here.
    }


    public static function init()
    {
        //==================================== WooCommerce Settings ===================================
        add_action('admin_enqueue_scripts', array('BakExtension\core\Settings', 'add_extension_register_script'));
        add_filter('woocommerce_settings_tabs_array', array('BakExtension\core\Settings', 'add_bak_settings'), 50);
        add_action('woocommerce_settings_tabs_bak_settings', array('BakExtension\core\Settings', 'bak_add_bak_settings'));
        add_action('woocommerce_update_options_bak_settings', array('BakExtension\core\Settings', 'bak_update_options_bak_settings'));

        //==================================== REST api ===================================
        add_action('rest_api_init', array('BakExtension\api\RestRoutes', 'auth_routes'));
        add_action('rest_api_init', array('BakExtension\api\RestRoutes', 'product_routes'));

        //==================================== Post List ===================================
        add_filter('manage_product_posts_columns', array("BakExtension\controllers\PostList", 'bak_fingerprint_column'));
        add_filter('bulk_actions-edit-product', array("BakExtension\controllers\PostList", 'add_mint_bulk_action'));
        add_action('manage_product_posts_custom_column', array("BakExtension\controllers\PostList", 'bak_fingerprint_column_data'), 10, 2);
        add_filter('woocommerce_product_filters', array("BakExtension\controllers\PostList", 'bak_custom_filter'));
        add_action('pre_get_posts', array("BakExtension\controllers\PostList", 'bak_post_filter_query'));
        
        //==================================== Post  ===================================
        add_filter('woocommerce_product_tabs', array("BakExtension\controllers\Post", 'bakrypt_blockchain_post_tab'));
        add_filter('woocommerce_product_data_tabs', array("BakExtension\controllers\Post", 'bakrypt_blockchain_post_data_tab'));
        add_action('woocommerce_product_data_panels', array("BakExtension\controllers\Post", 'bakrypt_blockchain_post_data_fields'));
        add_action("add_meta_boxes", array("BakExtension\controllers\Post", "add_ipfs_meta_box"));
        add_action('woocommerce_process_product_meta', array("BakExtension\controllers\Post", 'bak_save_blockchain_meta'));
        add_action('wp_ajax_product_token_get_image', array("BakExtension\controllers\Post", 'post_token_get_image'));

    }


    /**
     * Main Extension Instance.
     * Ensures only one instance of the extension is loaded or can be loaded.
     */
    public static function instance()
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    /**
     * Cloning is forbidden.
     */
    public function __clone()
    {
        // Override this PHP function to prevent unwanted copies of your instance.
        // Implement your own error or use `wc_doing_it_wrong()`
    }

    /**
     * Unserializing instances of this class is forbidden.
     */
    public function __wakeup()
    {
        // Override this PHP function to prevent unwanted copies of your instance.
        // Implement your own error or use `wc_doing_it_wrong()`
    }
}

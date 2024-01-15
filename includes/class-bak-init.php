<?php

/**
 *
 * A class which initiates the plugin
 *
 * @package Bakrypt\Classes
 * @version 1.0.0
 * @since   1.0.0
 */

namespace BakWP\core;

defined('ABSPATH') || exit;

class BakWP
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
        //==================================== Settings ===================================
        add_action('admin_enqueue_scripts', array('BakWP\core\Settings', 'add_extension_register_script'));
        add_action('admin_menu', array('BakWP\core\Settings', 'add_bak_options_page'));
        add_action('admin_init', array('BakWP\core\Settings', 'register_bak_settings'));

        //==================================== REST api ===================================
        add_action('rest_api_init', array('BakWP\api\RestRoutes', 'auth_routes'));
        add_action('rest_api_init', array('BakWP\api\RestRoutes', 'post_routes'));

        //==================================== Post List ===================================
        add_filter('manage_posts_columns', array("BakWP\controllers\PostList", 'bak_fingerprint_column'));
        add_action('manage_posts_custom_column', array("BakWP\controllers\PostList", 'bak_fingerprint_column_data'), 10, 2);
        add_filter('restrict_manage_posts', array("BakWP\controllers\PostList", 'bak_custom_filter'));
        add_filter('bulk_actions-edit-post', array("BakWP\controllers\PostList", 'add_mint_bulk_action'));
        add_filter('parse_query', array("BakWP\controllers\PostList", 'bak_post_filter_query'));

        // //==================================== Post  ===================================
        // add_filter('woocommerce_product_tabs', array("BakWP\controllers\Post", 'bakrypt_blockchain_post_tab'));
        // add_filter('woocommerce_product_data_tabs', array("BakWP\controllers\Post", 'bakrypt_blockchain_post_data_tab'));
        // add_action('woocommerce_product_data_panels', array("BakWP\controllers\Post", 'bakrypt_blockchain_post_data_fields'));
        // add_action("add_meta_boxes", array("BakWP\controllers\Post", "add_ipfs_meta_box"));
        // add_action('woocommerce_process_product_meta', array("BakWP\controllers\Post", 'bak_save_blockchain_meta'));
        // add_action('wp_ajax_product_token_get_image', array("BakWP\controllers\Post", 'post_token_get_image'));

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
}


function OnHomepageException(e)
{
	}


GHomepage = {
	oSettings: {},
	oApplicableSettings: {"main_cluster":{"top_sellers":true,"early_access":true,"games_already_in_library":true,"recommended_for_you":true,"prepurchase":true,"games":"always","software":true,"dlc_for_you":true,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":"always","games_not_in_library":null,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":true,"hidden":null},"new_on_steam":{"top_sellers":null,"early_access":true,"games_already_in_library":true,"recommended_for_you":null,"prepurchase":null,"games":"always","software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":null,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":null,"hidden":null},"recently_updated":{"top_sellers":null,"early_access":true,"games_already_in_library":null,"recommended_for_you":null,"prepurchase":null,"games":"always","software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":true,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":null,"hidden":null},"tabs":null,"specials":null,"more_recommendations":null,"friend_recommendations":null,"curators":{"top_sellers":null,"early_access":true,"games_already_in_library":true,"recommended_for_you":null,"prepurchase":null,"games":"always","software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":null,"only_current_platform":true,"video":true,"localized":true,"virtual_reality":true,"recommended_by_curators":null,"hidden":null},"home":{"top_sellers":null,"early_access":true,"games_already_in_library":null,"recommended_for_you":null,"prepurchase":true,"games":null,"software":true,"dlc_for_you":null,"dlc":null,"recently_viewed":null,"new_on_steam":null,"popular_new_releases":null,"games_not_in_library":null,"only_current_platform":null,"video":true,"localized":null,"virtual_reality":true,"recommended_by_curators":null,"hidden":null}},

	oDisplayListsRaw: {},
	oDisplayLists: {},

	oFeaturedMainCapItems: {},

	rgRecommendedGames: [],
	rgFriendRecommendations: [],	// { appid, accountid_friends, time_most_recent_recommendation }

	rgCuratedAppsData: [],
	rgAppsRecommendedByCurators: [],
	rgUserNewsFriendsPurchased: {},
	rgTopSteamCurators: [],

	bUserDataReady: false,
	bStaticDataReady: false,
	bLoadedActiveData: false,

	MainCapCluster: null,

	InitLayout: function()
	{
		var $Ctn = $J('.home_page_body_ctn');
		if ( $Ctn.hasClass('has_takeover') )
		{
			var $Background = $Ctn.children( '.page_background_holder' );
			var $Menu = $J('#store_header');

			var $TakeoverLink = $J('.home_page_takeover_link' ).children().first();
			var nInitialTakeoverLinkHeight = $TakeoverLink.height();

			$J(window ).on('Responsive_SmallScreenModeToggled.StoreHomeLayout', function() {
				if ( window.UseSmallScreenMode && window.UseSmallScreenMode() )
				{
					// the -5vw here accounts for the bit that would normally be overlapped by the menu, we use
					//	viewport-relative units because the background is being scaled relative to the viewport.
					$Background.css( 'background-position', 'center -3.5vw' );

					// this is the link, which also allocates the space for the takeover to be visible above the cluster rotation.
					//	we scale it based on the viewport width, assuming the initial width was 940px
					if ( nInitialTakeoverLinkHeight )
						$TakeoverLink.css( 'height', Math.floor( nInitialTakeoverLinkHeight / 940 * 100 ) + 'vw' );

				}
				else
				{
					$Background.css( 'top', '' ).css('background-position', '');
					if ( nInitialTakeoverLinkHeight )
						$TakeoverLink.css( 'height', nInitialTakeoverLinkHeight + 'px' );
				}
			} ).trigger('Responsive_SmallScreenModeToggled.StoreHomeLayout');
		}

		InitHorizontalAutoSliders();

		

		if ( window.Responsive_ReparentItemsInResponsiveMode )
		{
			window.Responsive_ReparentItemsInResponsiveMode( '.spotlight_block', $J('#home_responsive_spotlight_ctn') );
		}
	},

	InitUserData: function( rgParams )
	{
		try {
			GHomepage.oSettings = rgParams.oSettings;
			GHomepage.CheckLocalStorageSettings();

			if ( rgParams.rgRecommendedGames && rgParams.rgRecommendedGames.length )
			{
				var rgRecommendedAppIDs = v_shuffle( rgParams.rgRecommendedGames );
				for( var i = 0; i < rgRecommendedAppIDs.length; i++ )
				{
					GHomepage.rgRecommendedGames.push( { appid: rgRecommendedAppIDs[i], recommended: true } );
				}
			}

			if ( g_AccountID == 0 )
			{
				$J('#home_recommended_spotlight_notloggedin').show();
				$J('.home_top_sellers_area').show();
				$J('.home_logged_in').hide();
				$J('.home_friends_purchased_area').hide();
				$J('.home_btn.home_customize_btn').hide();
			}
			else
			{
				$J('#home_recommended_more').show();
			}

			GHomepage.rgCuratedAppsData = rgParams.rgCuratedAppsData || {};
			if ( rgParams.rgCuratedAppsData['apps'] && rgParams.rgCuratedAppsData['apps'].length )
			{
				var rgRecommendedAppIDs = v_shuffle( rgParams.rgCuratedAppsData['apps'] );
				for( var i = 0; i < rgRecommendedAppIDs.length; i++ )
				{
					GHomepage.rgAppsRecommendedByCurators.push( { appid: rgRecommendedAppIDs[i].appid, recommended_by_curator: true } );
				}
			}

			GHomepage.rgAppsRecommendedByCurators = rgParams.rgAppsRecommendedByCurators || [];
			GHomepage.rgUserNewsFriendsPurchased = rgParams.rgUserNewsFriendsPurchased || {};
			GHomepage.rgTopSteamCurators = rgParams.rgTopSteamCurators || [];
			GHomepage.rgFriendRecommendations = v_shuffle( rgParams.rgFriendRecommendations ) || [];
			GHomepage.rgCuratorExtendedAppData = rgParams.rgCuratorExtendedAppData || {};
		} catch( e ) { OnHomepageException(e); }

		GHomepage.bUserDataReady = true;
		if ( GHomepage.bStaticDataReady )
			GHomepage.OnHomeDataReady();
	},

	InitStaticData: function( rgParams )
	{
		try {
			GHomepage.oDisplayListsRaw = rgParams.rgDisplayLists;
			GHomepage.bShuffleInMainLegacy = rgParams.bShuffleInMainLegacy;
			GHomepage.rgMarketingMessages = rgParams.rgMarketingMessages;
		} catch( e ) { OnHomepageException(e); }

		GHomepage.bStaticDataReady = true;
		if ( GHomepage.bUserDataReady )
			GHomepage.OnHomeDataReady();
	},

	// Call this when we think the user is "active" (ie more than just loading the page as a bookmark/defauly or
	// clicking straight out)
	OnHomeActivate: function()
	{
		if( this.bLoadedActiveData )
			return;

		this.bLoadedActiveData = true;

		try {
			if ( g_AccountID != 0 )
			{
				$J.ajax( {
					url: "http:\/\/store.steampowered.com\/default\/home_additional\/",
					data: {

					},
					dataType: 'json',
					type: 'GET'
				}).done(function( data ) {

					GStoreItemData.AddStoreItemData( data.item_data, {} )

					GHomepage.oAdditionalData = data;
					GHomepage.OnAdditionalDataReady();

				});
			}

		} catch(e) { OnHomepageException(e); }
	},

	OnAdditionalDataReady: function()
	{
		try {
			GHomepage.RenderRecentlyUpdatedV2();
		} catch( e ) { OnHomepageException(e); }
	},

	OnHomeDataReady: function()
	{
		try {
			if ( g_AccountID != 0 )
			{
				$J('#discovery_queue').append( $J('#static_discovery_queue_elements').children() );
				$J('#static_discovery_queeue_elements').remove();
				$J('.discovery_queue_ctn').show();
			}

		} catch(e) { OnHomepageException(e); }

		GDynamicStore.OnReady( GHomepage.OnDynamicStoreReady );
	},

	OnDynamicStoreReady: function()
	{
		var HomeSettings;
		var bHaveUser = ( g_AccountID != 0 );

		// RECOMMENDED SPOTLIGHTS
		try {
			// we render this first, it may "steal" some recommendations from the main cap to show here instead.
			if ( bHaveUser )
				GHomepage.RenderRecommendedForYouSpotlight();
		} catch( e ) { OnHomepageException(e); }


		GHomepage.oDisplayLists.main_cluster_legacy = GHomepage.oDisplayListsRaw.main_cluster_legacy || [];
		GHomepage.oDisplayLists.main_cluster = GHomepage.oDisplayListsRaw.main_cluster || [];
		GHomepage.oDisplayLists.top_sellers = GHomepage.oDisplayListsRaw.top_sellers || [];
		GHomepage.oDisplayLists.popular_new = GHomepage.oDisplayListsRaw.popular_new_releases || [];
		GHomepage.oDisplayLists.new_on_steam = GHomepage.MergeLists(
			GHomepage.oDisplayListsRaw.featured_items, true,
			GHomepage.oDisplayLists.popular_new, false
		);

		GHomepage.oDisplayLists.popular_new_on_steam = GHomepage.MergeLists(
			GHomepage.oDisplayListsRaw.popular_featured_items, true,
			GHomepage.oDisplayLists.popular_new, true
		);

		// Recently viewed apps (Side bar)
		try {
			GHomepage.RenderRecentApps();
		} catch( e ) { OnHomepageException(e); }

		
		// Recommended
		try {
			GHomepage.RenderRecommendedBlock();
		} catch( e ) { OnHomepageException(e); }

		// CURATORS
		try {
			if ( bHaveUser )
			{
				HomeSettings = new CHomeSettings( 'curators', GSteamCurators.Render );
				$J('.apps_recommended_by_curators_ctn .home_page_content .home_actions_ctn').append( HomeSettings.RenderCustomizeButton() );
			}
			GSteamCurators.Init( GHomepage.rgTopSteamCurators, GHomepage.rgCuratedAppsData );
		} catch( e ) { OnHomepageException(e); }

		// MAIN CLUSTER
		try {
						if ( bHaveUser )
			{
				HomeSettings = new CHomeSettings( 'main_cluster', GHomepage.RenderMainCluster );
				$J('.main_cluster_ctn').append( HomeSettings.RenderCustomizeButton() );
			}
						GHomepage.RenderMainCluster();

		} catch( e ) { OnHomepageException(e); }

		// NEW ON STEAM
		try {
			if ( bHaveUser )
			{
				HomeSettings = new CHomeSettings( 'new_on_steam', GHomepage.RenderNewOnSteam );
				$J('.home_smallcap_area.new_on_steam .home_actions_ctn').append( HomeSettings.RenderCustomizeButton() );
			}
			GHomepage.RenderNewOnSteam();
		} catch( e ) { OnHomepageException(e); }

		// POPULAR NEW ON STEAM
		try {
			if ( bHaveUser )
			{
				HomeSettings = new CHomeSettings( 'new_on_steam', GHomepage.RenderPopularNewOnSteam );
				$J('.home_smallcap_area.popular_new_on_steam .home_actions_ctn').append( HomeSettings.RenderCustomizeButton() );
			}
			GHomepage.RenderPopularNewOnSteam();
		} catch( e ) { OnHomepageException(e); }


		// Popular new
		try {
			GHomepage.FilterPopularNewOnSteam();
		} catch( e ) { OnHomepageException(e); }

		// under10
		try {
			GHomepage.FilterUnder10();
		} catch( e ) { OnHomepageException(e); }


		// RECENTLY UPDATED
		try {
			if ( bHaveUser )
			{
				HomeSettings = new CHomeSettings( 'recently_updated', GHomepage.RenderRecentlyUpdated );
				$J('.home_smallcap_area.recently_updated .home_actions_ctn').append( HomeSettings.RenderCustomizeButton() );
			}
			GHomepage.oDisplayLists.recently_updated = GHomepage.MergeLists(
				GHomepage.oDisplayListsRaw.featured_update_round, true,
				GHomepage.oDisplayListsRaw.other_update_round, false
			);
			GHomepage.RenderRecentlyUpdated();

		} catch( e ) { OnHomepageException(e); }

		// Top sellers (Not logged in)
		try {
			GHomepage.RenderTopSellersArea();
		} catch( e ) { OnHomepageException(e); }

		// Marketing Messages
		try {
			GHomepage.RenderMarketingMessages();
		} catch( e ) { OnHomepageException(e); }

		// FRIENDS RECENTLY PURCHASED
		try {
			GHomepage.RenderFriendsRecentlyPurchased();
		} catch( e ) { OnHomepageException(e); }


		// RECOMMENDED TAGS
		try {
			if ( bHaveUser && GDynamicStore.s_rgRecommendedTags.length )
			{
				GHomepage.RenderRecommendedTags();
			}
		} catch( e ) { OnHomepageException(e); }

		GHomepage.oDisplayListsRaw = null;

		$J(window ).on('Responsive_SmallScreenModeToggled.StoreHome', function() {
			// re-render the guys that adjust # of items in responsive mode
			GHomepage.RenderNewOnSteam();
			GHomepage.RenderRecentlyUpdated();
			GSteamCurators.Render();
		});

		// More Content
		if( bHaveUser )
		{
			$J('#content_more').autoloader({template_url: 'http://store.steampowered.com/explore/render/', recommendations_url: 'http://store.steampowered.com/explore/recommended/', additional_url: 'http://store.steampowered.com/explore/more'});
		}
		else
		{
			$J('#content_more').hide();
			$J('#content_loading').hide();
			$J('#content_callout').hide();
			$J('#content_login').show();
		}
	},

	ItemKey: function( rgItem )
	{
		return rgItem.appid ? 'a' + rgItem.appid : 'p' + rgItem.packageid;
	},

	RenderRecentApps: function()
	{
		var strRecentApps = WebStorage.GetCookie('recentapps');
		if( !strRecentApps )
			return;

		var rgApps = Object.keys( strRecentApps );

		if( rgApps && rgApps.length > 0)
		{
			for( var i=0; i<rgApps.length; i++ )
			{
				var unAppID = rgApps[i];

				var params = {'class': 'gutter_item'};
				var rgItemData = GStoreItemData.GetCapParams( 'gutter_recent', unAppID, 0, params );

				if( !rgItemData || !rgItemData.name )
					continue;

				var eleRow = $J('<a/>', params ).text( rgItemData.name );

				$J('#home_gutter_recentlyviewed .gutter_items').append(eleRow);
			}
		}

		if( $J('#home_gutter_recentlyviewed .gutter_items').children().length > 0 )
		{
			var eleContainer = $J('#home_gutter_recentlyviewed');
			eleContainer.show();
			eleContainer.InstrumentLinks();
			//GDynamicStore.DecorateDynamicItems( eleContainer );
		}
	},

	SetDefaultSpotlight: function()
	{
		var $elSpotlightContainer = $J('#spotlight_scroll');
		var elBestTarget = false;
		var rgSpotlights = $elSpotlightContainer.children();

		// Build a list of appids so we can run through our normal filter code.
		var rgAppIds = [];
		for( var i=0; i<rgSpotlights.length; i++)
		{
			var unAppId = rgSpotlights[i].dataset.dsAppid;
			rgAppIds.push({ appid: unAppId })
		}

		// Now filter...
		rgAppIds = GHomepage.FilterItemsForDisplay(
			rgAppIds, 'home', 0, 10, { games_already_in_library: false, localized: true }
		);

		// Find the spotlight for our appid
		if( rgAppIds.length > 0 )
		{
			for ( var i = 0; i < rgSpotlights.length; i++ )
			{
				var unAppId = rgSpotlights[ i ].dataset.dsAppid;

				// Now run over our "good" spotlights
				for ( var j = 0; j < rgAppIds.length; j++ )
				{
					if ( unAppId && unAppId == rgAppIds[ j ].appid )
					{
						// Found an ideal spotlight, but it's position 0, so just early out
						if ( i == 0 )
							return;

						elBestTarget = rgSpotlights[ i ];

					}
				}
			}
		}


		if( elBestTarget )
		{
			$elSpotlightContainer.prepend ( elBestTarget );
			$elSpotlightContainer.children ().hide ();
			$J ( elBestTarget ).show ();
		}

	},


	RenderMainCluster: function()
	{

		for ( var i = 0; i < GHomepage.oDisplayLists.popular_new.length; i++ )
		{
			GHomepage.oDisplayLists.popular_new[i].new_on_steam = true;
		}
		for ( var i = 0; i < GHomepage.oDisplayLists.top_sellers.length; i++ )
		{
			GHomepage.oDisplayLists.top_sellers[i].top_seller = true;
		}
		if ( GHomepage.rgCuratedAppsData.apps )
		{
			for (var i = 0; i < GHomepage.rgCuratedAppsData.apps.length; i++) {
				GHomepage.rgCuratedAppsData.apps[i].recommended_by_curator = true;
			}
		}

		var rgTopSellers = [];
		if ( oSettings && oSettings.top_sellers )
			rgTopSellers = GHomepage.oDisplayLists.top_sellers;

		var rgDisplayListCombined = GHomepage.MergeLists(
			GHomepage.oDisplayLists.main_cluster, true,
			rgTopSellers, false
		);
		var oSettings = GHomepage.oSettings.main_cluster;

		GHomepage.oFeaturedMainCapItems = {};

		if ( oSettings && oSettings.recommended_for_you )
		{
			rgDisplayListCombined = GHomepage.ZipLists(
				rgDisplayListCombined, false,
				GHomepage.rgRecommendedGames, true
			);
		}
		var bZippedCurators = false;

		

		if( !bZippedCurators )
		{
			rgDisplayListCombined = GHomepage.ZipLists(
				rgDisplayListCombined, false,
				GHomepage.oDisplayLists.popular_new.slice( 0, 20 ), true
			);
		}

		rgDisplayListCombined = GHomepage.MergeLists(
			GHomepage.oDisplayLists.main_cluster_legacy, false,
			rgDisplayListCombined, false
		);


				var rgMainCaps = GHomepage.FilterItemsForDisplay(
			rgDisplayListCombined, 'main_cluster', 2, 15
		);
		
		GDynamicStore.MarkAppDisplayed( rgMainCaps );

		if ( GHomepage.bShuffleInMainLegacy )
			rgMainCaps = v_shuffle( rgMainCaps );

		for ( var i = 0; i < rgMainCaps.length; i++ )
		{
			GHomepage.oFeaturedMainCapItems[ GHomepage.ItemKey( rgMainCaps[i] ) ] = true;
		}

		var cMainCaps = Cluster.BuildClusterElements( $J('#main_cluster_scroll'), rgMainCaps );

		// global
		if ( GHomepage.MainCapCluster )
			GHomepage.MainCapCluster.setCaps( cMainCaps );
		else
			GHomepage.MainCapCluster = new Cluster( {
				cCapCount: cMainCaps,
				nCapWidth: 616 + 4,
				elClusterArea: $J('#home_main_cluster'),
				elSlider: $J('#main_cluster_control'),
				elScrollLeftBtn: $J('#main_cluster_control_previous'),
				elScrollRightBtn: $J('#main_cluster_control_next'),
				bUseActiveClass: true,
				rgImageURLs: {},
				onChangeCB: GDynamicStore.HandleClusterChange
			} );

	},

	// Unused
	RenderNewOnSteam: function()
	{
		var rgNewOnSteamNoMainCap = [];
		for( var i = 0; i < GHomepage.oDisplayLists.new_on_steam.length; i++ )
		{
			var rgItem = GHomepage.oDisplayLists.new_on_steam[i];
			if ( !GHomepage.oFeaturedMainCapItems[ GHomepage.ItemKey( rgItem ) ] )
				rgNewOnSteamNoMainCap.push( rgItem );
		}

		var rgFeaturedLaunchTitles = GHomepage.FilterItemsForDisplay(
			rgNewOnSteamNoMainCap, 'new_on_steam', 4, window.UseSmallScreenMode && window.UseSmallScreenMode() ? 9 : 4
		);

		var $NewOnSteam = $J('.home_smallcap_area.new_on_steam .home_smallcaps' ).empty();
		for( var i = 0; i < rgFeaturedLaunchTitles.length; i++ )
		{
			var oItem = rgFeaturedLaunchTitles[i];

			var $CapCtn = GHomepage.BuildHomePageHeaderCap( 'new_on_steam', oItem.appid, oItem.packageid );
			$NewOnSteam.append( $CapCtn );
		}
		$NewOnSteam.append( $J('<div/>', {'style': 'clear: left;' } ) );
		$NewOnSteam.trigger('v_contentschanged');	// update our horizontal scrollbars if needed

		if ( rgFeaturedLaunchTitles.length )
		{
			$J('.home_smallcap_area.new_on_steam').show();
			$NewOnSteam.InstrumentLinks();
			GDynamicStore.DecorateDynamicItems( $NewOnSteam );
		}
		else
		{
			$J('.home_smallcap_area.new_on_steam').hide();
		}
	},

	RenderFriendsRecentlyPurchased: function()
	{
		var $RecentlyUpdated =  $J('.home_smallcap_area.friends_recently_purchased .home_smallcaps' ).empty();


		var rgCapsules = GHomepage.FilterItemsForDisplay(
			GHomepage.rgUserNewsFriendsPurchased, 'home', 4, 8, { games_already_in_library: false, dlc: false, localized: true, displayed_elsewhere: false }
		);
		if( rgCapsules.length < 4 )
		{
			rgCapsules = GHomepage.FilterItemsForDisplay(
				GHomepage.rgUserNewsFriendsPurchased, 'home', 4, 8, { games_already_in_library: false, localized: true }
			);
		}

		for( var j=0; j<rgCapsules.length; j++ )
		{

			var oItem = rgCapsules[ j ];
			var nAppId = oItem.appid;
			var $CapCtn = GHomepage.BuildHomePageGenericCap( 'friends_recently_purchased', nAppId, 0 );
			var $FriendsCtn = $J('<div class="friends_container" />');
			$CapCtn.append($FriendsCtn);

			var nAdditionalFriends = 0;

			var $AvatarsCtn = $J('<div class="avatars" />');
			$FriendsCtn.append($AvatarsCtn);

			for( var i = 0; i < oItem.friends.length; i++ )
			{
				if( i > 4)
				{
					nAdditionalFriends = oItem.friends.length - i;
					break;
				}

				var friend = oItem.friends[i];
				var $AvatarCap = $J('<a href="%1$s" ds-miniprofile="%3$s"><img src="%2$s"></a>'.replace(/\%1\$s/g, friend.profile_url).replace(/\%2\$s/g, friend.avatar).replace(/\%3\$s/g, friend.accountid) );
				$AvatarsCtn.append( $AvatarCap );
			}

			var $FriendsTotal = $J('<div class="friends_total" ></div>').html( oItem.friends.length + '<span> </span>' );
			$FriendsCtn.append( $FriendsTotal );

			$RecentlyUpdated.append( $CapCtn );
		}
		$RecentlyUpdated.trigger('v_contentschanged');	// update our horizontal scrollbars if needed


		if ( $RecentlyUpdated.children().length > 3 )
		{
			$J('.friends_recently_purchased').show();
			$RecentlyUpdated.InstrumentLinks();
			GDynamicStore.DecorateDynamicItems( $RecentlyUpdated );
		}
		else
		{
			$J('.home_friends_purchased_area').hide();
			$J('.home_top_sellers_area').show();
		}
	},

	// Unused
	RenderPopularNewOnSteam: function()
	{
		var rgNewOnSteamNoMainCap = [];
		for( var i = 0; i < GHomepage.oDisplayLists.popular_new_on_steam.length; i++ )
		{
			var rgItem = GHomepage.oDisplayLists.popular_new_on_steam[i];
			if ( !GHomepage.oFeaturedMainCapItems[ GHomepage.ItemKey( rgItem ) ] )
				rgNewOnSteamNoMainCap.push( rgItem );
		}

		var rgFeaturedLaunchTitles = GHomepage.FilterItemsForDisplay(
			rgNewOnSteamNoMainCap, 'new_on_steam', 3, 3
		);

		var $NewOnSteam = $J('.home_smallcap_area.popular_new_on_steam .home_headercaps' );
		for( var i = 0; i < rgFeaturedLaunchTitles.length; i++ )
		{
			var oItem = rgFeaturedLaunchTitles[i];

			var $CapCtn = GHomepage.BuildHomePageHeaderCap( 'popular_new_on_steam', oItem.appid, oItem.packageid );
			$NewOnSteam.prepend( $CapCtn );
		}
		$NewOnSteam.append( $J('<div/>', {'style': 'clear: left;' } ) );
		$NewOnSteam.trigger('v_contentschanged');	// update our horizontal scrollbars if needed

		if ( rgFeaturedLaunchTitles.length )
		{
			$J('.home_smallcap_area.popular_new_on_steam').show();
			$NewOnSteam.InstrumentLinks();
			GDynamicStore.DecorateDynamicItems( $NewOnSteam );
		}
		else
		{
			$J('.home_smallcap_area.popular_new_on_steam').hide();
		}
	},


	// Unused
	RenderRecentlyUpdated: function()
	{
		var rgFeaturedUpdateTitles = GHomepage.FilterItemsForDisplay(
			GHomepage.oDisplayLists.recently_updated, 'recently_updated', 3, window.UseSmallScreenMode && window.UseSmallScreenMode() ? 9 : 3
		);

		var $RecentlyUpdated =  $J('.home_smallcap_area.recently_updated .home_smallcaps' ).empty();
		for( var i = 0; i < rgFeaturedUpdateTitles.length; i++ )
		{
			var oItem = rgFeaturedUpdateTitles[i];

			var $CapCtn = GHomepage.BuildHomePageSmallCap( 'recently_updated', oItem.appid, 0 );
			$CapCtn.append( $J('<div/>', {'class': 'recently_updated_desc' }).text( oItem.description ) );
			if ( oItem.announcementid.length != 0 )
			{
				var strAnnouncementLink = 'http://steamcommunity.com/ogg/' + oItem.appid + '/announcements/detail/' + oItem.announcementid + '/';
				var $AnnouncementLink = $J('<div/>', {'class': 'recently_updated_announcement_link', 'text' : 'View Update Details', 'data-ds-link' : strAnnouncementLink } );
				$AnnouncementLink.click(function(e) {
					top.location.href = $J( this).attr( 'data-ds-link' );
					return false;
				} );
				$CapCtn.append( $AnnouncementLink );
			}
			$RecentlyUpdated.append( $CapCtn );
		}
		$RecentlyUpdated.append( $J('<div/>', {'style': 'clear: left;' } ) );
		$RecentlyUpdated.trigger('v_contentschanged');	// update our horizontal scrollbars if needed

		if ( rgFeaturedUpdateTitles.length )
		{
			$J('.home_smallcap_area.recently_updated').show();
			$RecentlyUpdated.InstrumentLinks();
			GDynamicStore.DecorateDynamicItems( $RecentlyUpdated );
		}
		else
		{
			$J('.home_smallcap_area.recently_updated').hide();
		}

	},

	RenderRecentlyUpdatedV2: function()
	{
		var $RecentlyUpdated =  $J('.recently_updated .store_capsule_container' ).empty();

		var rgCapsules = GHomepage.FilterItemsForDisplay(
			GHomepage.oAdditionalData.recent_updates, 'home', 4, 8
		);

		for( var i = 0; i < rgCapsules.length; i++ )
		{
			var oItem = rgCapsules[i];

			var $CapCtn = GHomepage.BuildHomePageGenericCap( 'recently_updated', oItem.appid, 0 );
			$CapCtn.append( $J('<div/>', {'class': 'recently_updated_desc' }).text( oItem.description ) );
			if ( oItem.announcementid.length != 0 )
			{
				var strAnnouncementLink = 'http://steamcommunity.com/ogg/' + oItem.appid + '/announcements/detail/' + oItem.announcementid + '/';
				var $AnnouncementLink = $J('<div/>', {'class': 'recently_updated_announcement_link', 'text' : 'View Update Details', 'data-ds-link' : strAnnouncementLink } );
				$AnnouncementLink.click(function(e) {
					top.location.href = $J( this).attr( 'data-ds-link' );
					return false;
				} );
				$CapCtn.append( $AnnouncementLink );
			}
			$RecentlyUpdated.append( $CapCtn );
		}

		if ( $RecentlyUpdated.children().length > 3 )
		{
			$J('.recently_updated_block').show();
			$RecentlyUpdated.InstrumentLinks();
			GDynamicStore.DecorateDynamicItems( $RecentlyUpdated );
			$RecentlyUpdated.trigger('v_contentschanged');	// update our horizontal scrollbars if needed
		}

	},

	RenderRecommendedBlock: function()
	{
		var $Recommended =  $J('.home_specials_ctn.recommended' );

		var rgCapsules = GHomepage.FilterItemsForDisplay(
			GHomepage.rgRecommendedGames, 'home', 4, 4, { games_already_in_library: false, localized: true, displayed_elsewhere: false }
		);

		GDynamicStore.MarkAppDisplayed( rgCapsules );

		for( var i = 0; i < rgCapsules.length; i++ )
		{
			var oItem = rgCapsules[i];
			var $CapCtn = GHomepage.BuildHomePageGenericCap( 'home_recommended', oItem.appid, 0 );

			$Recommended.append( $CapCtn );
		}

		if ( $Recommended.children().length == 5 ) // 4 caps + h2
		{
			$J('.home_specials_ctn.specials').hide();
			$Recommended.show();
			$Recommended.InstrumentLinks();
			GDynamicStore.DecorateDynamicItems( $Recommended );
			$Recommended.trigger('v_contentschanged');	// update our horizontal scrollbars if needed
		}

	},
	FilterCapsules: function( nMin, nMax, $elElements, $elContainer)
	{
		var nCapsules = $elElements.length;

		// Remove ignored stuff first
		for( var i = 0; i < $elElements.length; i++ )
		{
			var $capsule = $J( $elElements[i] );
			var nAppId = $capsule.data('ds-appid');

			if( GDynamicStore.BIsAppIgnored(nAppId) )
			{
				$capsule.hide();
				nCapsules--;
			} else
				$capsule.removeClass('hidden'); // Force show here since we might have hidden it for other reasons
		}

		// Now follow filters as long we we can keep 4 items in the capsule
		for( var i = 0; i < $elElements.length; i++ )
		{
			var $capsule = $J( $elElements[i] );
			var nAppId = $capsule.data('ds-appid');

			var rgFilterTest = GHomepage.FilterItemsForDisplay(
				[{'appid': nAppId}], 'home', 0, 1, { games_already_in_library: false, localized: true, displayed_elsewhere: false }
			);

			if(  rgFilterTest.length == 0 )
			{
				$capsule.hide();
				nCapsules--;
			}
			if( nCapsules == nMin )
				break;
		}

		// Cap number of capsules to 8

		var nVisible = 0;
		for( var i = 0; i < $elElements.length; i++ )
		{
			var $capsule = $J( $elElements[i] );
			if(!$capsule.is(':visible'))
				continue;

			if( nVisible++ >= nMax)
				$capsule.hide();

		}

		$elElements.parent().trigger('v_contentschanged');

		if( nCapsules < nMin && $elContainer )
			$elContainer.hide();
	},

	FilterPopularNewOnSteam: function()
	{
		var $PopularNewCapsules =  $J('.screenshots_capsule  .carousel_thumbs' );

		this.FilterCapsules( 4, 10, $PopularNewCapsules.children(), $J('.recent_top_sellers ') )

	},

	FilterUnder10: function()
	{
		var $UnderTenCapsules =  $J('.home_specials_ctn.underten .home_specials_grid' );

		this.FilterCapsules( 4, 6, $UnderTenCapsules.children() )

	},

	RenderTopSellersArea: function()
	{
		var rgTopSellers = GHomepage.FilterItemsForDisplay(
			GHomepage.oDisplayLists.top_sellers, 'home', 2, 2, { games_already_in_library: false, localized: true }
		);

		GDynamicStore.MarkAppDisplayed( rgTopSellers );

		var $TopSellersCtn =  $J('.home_top_sellers_area .store_capsule_container' ).empty();
		for( var i = 0; i < rgTopSellers.length; i++ )
		{
			var oItem = rgTopSellers[i];

			var $CapCtn = GHomepage.BuildHomePageGenericCap( 'top_sellers_nologin', oItem.appid, 0 );
			$TopSellersCtn.append( $CapCtn );
		}

		$TopSellersCtn.trigger('v_contentschanged');	// update our horizontal scrollbars if needed

		$TopSellersCtn.InstrumentLinks();
		GDynamicStore.DecorateDynamicItems( $TopSellersCtn );



	},



	MergeLists: function( /* rgList1, bShuffle1, rgList2, bShuffleList2, rgList3, bShuffleList3, etc... */ )
	{
		return GHomepage.MergeListsInternal( arguments, false );
	},

	ZipLists: function( /* rgList1, bShuffle1, rgList2, bShuffleList2, rgList3, bShuffleList3, etc... */ )
	{
		return GHomepage.MergeListsInternal( arguments, true );
	},

	MergeListsInternal: function( args, bZip )
	{
		var rgLists = [];
		for ( var iArg = 0; iArg < args.length; iArg++ )
		{
			var rgList = args[iArg];
			if ( iArg + 1 < args.length && args[++iArg] )
				rgList = v_shuffle( rgList );
			rgLists.push( rgList );
		}

		var oIncludedItems = {};
		var rgOutput = [];

		var fnAddItem = function( rgItem ) {
			var key = GHomepage.ItemKey( rgItem );
			if ( !oIncludedItems[key] )
			{
				oIncludedItems[key] = true;
				rgOutput.push( rgItem );
				return true;
			}
			return false;
		};

		if ( bZip )
		{
			var rgIndicies = [];
			while( rgIndicies.length < rgLists.length )
				rgIndicies.push( 0 );

			var bRemaining = true;
			while ( bRemaining )
			{
				bRemaining = false;
				for( var iList = 0; iList < rgLists.length; iList++ )
				{
					var rgList = rgLists[iList];
					var i = rgIndicies[iList];
					if ( i >= rgList.length )
						continue;

					// keep trying to add until one sticks
					while( i < rgList.length && !fnAddItem( rgList[i++] ) )
						;
					rgIndicies[iList] = i;
					bRemaining = true;
				}
			}
		}
		else
		{
			for ( var iList = 0; iList < rgLists.length; iList++ )
			{
				var rgList = rgLists[iList];
				for ( var i = 0; i < rgList.length; i++ )
					fnAddItem( rgList[i] );
			}
		}

		return rgOutput;
	},

	GetStoreItemData: function( rgItem )
	{
		return rgItem.appid ? GStoreItemData.rgAppData[ rgItem.appid] : GStoreItemData.rgPackageData[ rgItem.packageid ];
	},

	BuildHomePageSmallCap: function( strFeatureContext, unAppID, unPackageID )
	{
		var params = { 'class': 'home_smallcap' };
		var rgItemData = GStoreItemData.GetCapParams( strFeatureContext, unAppID, unPackageID, params );
		if ( !rgItemData )
			return null;

		var $CapCtn = $J('<a/>', params );
		GStoreItemData.BindHoverEvents( $CapCtn, unAppID, unPackageID );

		$CapCtn.append( $J('<img/>', { src: rgItemData.small_capsulev5 } ) );
		$CapCtn.append( $J('<div/>', {'class': 'home_smallcap_title ellipsis' } ).html( rgItemData.name ) );
		$CapCtn.append( $J('<div/>').html( rgItemData.discount_block ? $J(rgItemData.discount_block).addClass('discount_block_inline') : '&nbsp;' ) );

		return $CapCtn;
	},

	BuildHomePageHeaderCap: function( strFeatureContext, unAppID, unPackageID )
	{
		var params = { 'class': 'home_headercap' };
		var rgItemData = GStoreItemData.GetCapParams( strFeatureContext, unAppID, unPackageID, params );
		if ( !rgItemData )
			return null;

		var $CapCtn = $J('<a/>', params );
		GStoreItemData.BindHoverEvents( $CapCtn, unAppID, unPackageID );

		$CapCtn.append( $J('<img/>', { src: rgItemData.header } ) );
		$CapCtn.append( $J('<div/>', {'class': 'home_smallcap_title ellipsis' } ).html( rgItemData.name ) );
		$CapCtn.append( $J('<div/>').html( rgItemData.discount_block ? $J(rgItemData.discount_block).addClass('discount_block_inline') : '&nbsp;' ) );

		return $CapCtn;
	},

	BuildHomePageGenericCap: function( strFeatureContext, unAppID, unPackageID, rgOptions )
	{
		var rgOptions = $J.extend({
			'class': 'store_capsule',
			'include_title': false,
			'discount_class': 'discount_block_inline',
			'capsule_size': 'header'
		}, rgOptions ? rgOptions : {} );

		var params = { 'class': rgOptions.class };
		var rgItemData = GStoreItemData.GetCapParams( strFeatureContext, unAppID, unPackageID, params );
		if ( !rgItemData )
			return null;

		var $CapCtn = $J('<a/>', params );
		GStoreItemData.BindHoverEvents( $CapCtn, unAppID, unPackageID );

		var $ImgCtn = $J('<div class="capsule"/>').addClass( rgOptions.capsule_size );

		$ImgCtn.append( $J('<img/>', { src: rgItemData[rgOptions.capsule_size] } ) );
		$CapCtn.append( $ImgCtn );
		if( rgOptions.include_title )
			$CapCtn.append( $J('<div/>', {'class': 'title ellipsis' } ).html( rgItemData.name ) );
		$CapCtn.append( $J('<div/>').html( rgItemData.discount_block ? $J(rgItemData.discount_block).addClass( rgOptions.discount_class ) : '&nbsp;' ) );

		return $CapCtn;
	},

	FilterItemsForDisplay: function( rgItems, strSettingsName, cMinItemsToDisplay, cMaxItemsToDisplay, rgAdditionalSettings )
	{

		var Settings = GHomepage.oSettings[strSettingsName] || {};
		var ApplicableSettings = GHomepage.oApplicableSettings[strSettingsName] || {};

		// Allow sections to have additional, section-specific settings. We'll use jQuery to shallow copy the settings
		// object so we don't pollute future calls.
		if( rgAdditionalSettings )
		{
			Settings = jQuery.extend({}, Settings, rgAdditionalSettings);

			// Ensure our feature is turned on as an applicable setting
			for( var strKey in rgAdditionalSettings )
				rgAdditionalSettings[strKey] = true;

			ApplicableSettings = jQuery.extend({}, ApplicableSettings, rgAdditionalSettings);

		}

		if ( !cMaxItemsToDisplay )
			cMaxItemsToDisplay = cMinItemsToDisplay;

		return GStoreItemData.FilterItemsForDisplay( rgItems, Settings, ApplicableSettings, cMaxItemsToDisplay, cMinItemsToDisplay )
	},

	PersistSettings: function()
	{
		WebStorage.SetLocal( 'home_viewsettings', GHomepage.oSettings, true );
	},

	CheckLocalStorageSettings: function()
	{
		// to defeat bfcache
		var oSettings = WebStorage.GetLocal( 'home_viewsettings', true );
		if ( oSettings )
			GHomepage.oSettings = oSettings;
	},

	RenderRecommendedTags: function()
	{
		var rgGenreTags = [19,21,597,492,128,699,122,599,9,701,113,493];
		// array( 'tagid' => $Tag->tagid, 'name' => $Tag->name, 'weight' => $Tag->weight )

		var $TagBlock = $J('#home_gutter_recommendedtags');
		var $TagList = $TagBlock.find('.gutter_items');
		var cTagsFound = 0;
		for ( var i = 0; i < GDynamicStore.s_rgRecommendedTags.length; i++ )
		{
			var rgTag = GDynamicStore.s_rgRecommendedTags[i];
			if ( rgGenreTags.indexOf( rgTag.tagid ) == -1 )
			{
				var url = GStoreItemData.AddNavEventParamsToURL( 'http://store.steampowered.com/tag/en/TAGNAME/'.replace( /TAGNAME/, encodeURIComponent( rgTag.name ) ), 'gutter' );
				$TagList.append( $J('<a/>', {'class': 'gutter_item', 'href' : url}).text( rgTag.name ) );

				if ( ++cTagsFound >= 5 )
					break;
			}
		}
		if ( cTagsFound > 1 )
		{
			$TagList.InstrumentLinks();
			$TagBlock.show();
		}
	},

	RenderRecommendedForYouSpotlight: function()
	{
		var $Element = $J('#home_recommended_spotlight');
		var rgGamesShown = [];
		var nGamesToShow = 1;

		var rgRecommendedSpotlightOptions = [];

		// prefer recommended things that have a discount and passes filter
		for ( var i = 0; i < GHomepage.rgRecommendedGames.length && rgRecommendedSpotlightOptions.length < nGamesToShow; i++ )
		{
			var unAppID = GHomepage.rgRecommendedGames[i].appid;
			if ( GStoreItemData.BAppPassesFilters( unAppID, GHomepage.oSettings.main_cluster, GHomepage.oApplicableSettings.main_cluster ) &&
				 GStoreItemData.rgAppData[unAppID] && GStoreItemData.rgAppData[unAppID].discount )
				rgRecommendedSpotlightOptions.push( unAppID );
		}

		// then recommended items that pass the filter
		for ( var i = 0; i < GHomepage.rgRecommendedGames.length && rgRecommendedSpotlightOptions.length < nGamesToShow; i++ )
		{
			var unAppID = GHomepage.rgRecommendedGames[i].appid;
			if ( GStoreItemData.BAppPassesFilters( unAppID, GHomepage.oSettings.main_cluster, GHomepage.oApplicableSettings.main_cluster ) )
				rgRecommendedSpotlightOptions.push( unAppID );
		}

		if ( rgRecommendedSpotlightOptions.length > 0 )
		{
			var $Spotlight = GHomepage.RenderRecommendedSpotlight( rgRecommendedSpotlightOptions[0], 'Similar to games you play' );
			if ( $Spotlight )
			{
				$Element.append( $Spotlight );
				rgGamesShown.push( rgRecommendedSpotlightOptions[0] );
			}
		}

		if ( rgGamesShown.length < nGamesToShow )
		{
			// try and find something onsale from wishlist that we have data for
			var rgWishlistItemsOnSale = [];
			for ( var unAppID in GDynamicStore.s_rgWishlist )
			{
				if ( GStoreItemData.rgAppData[unAppID] && GStoreItemData.rgAppData[unAppID].discount &&
					rgGamesShown.indexOf( unAppID ) == -1 )
					rgWishlistItemsOnSale.push( unAppID );
			}

			v_shuffle( rgWishlistItemsOnSale );
			for ( var i = 0; i < rgWishlistItemsOnSale.length; i++ )
			{
				// game from wishlist on sale
				var $Spotlight = GHomepage.RenderRecommendedSpotlight( rgWishlistItemsOnSale[i], 'From your wishlist' );
				if ( $Spotlight )
				{
					$Spotlight.children( 'a.recommended_spotlight' ).addClass( 'wishlist_recommendation' );
					$Element.append( $Spotlight );
					rgGamesShown.push( rgWishlistItemsOnSale[i] );
					break;
				}
			}
		}

		if ( rgGamesShown.length < nGamesToShow && GHomepage.rgFriendRecommendations )
		{
			for ( var i = 0; i < GHomepage.rgFriendRecommendations.length; i++ )
			{
				var unAppID = GHomepage.rgFriendRecommendations[i].appid;
				if ( rgGamesShown.indexOf( unAppID ) == -1 )
				{
					var $Spotlight = GHomepage.RenderRecommendedSpotlight( unAppID, 'Recommended by friends' );
					if ( $Spotlight )
					{
						$Element.append( $Spotlight );
						rgGamesShown.push( unAppID );
						GHomepage.rgFriendRecommendations.splice( i, 1 );
						break;
					}
				}
			}
		}

		if ( rgGamesShown.length < nGamesToShow && rgRecommendedSpotlightOptions.length > 1 && rgGamesShown.indexOf( rgRecommendedSpotlightOptions[1] ) == -1 )
		{
			var $Spotlight = GHomepage.RenderRecommendedSpotlight( rgRecommendedSpotlightOptions[1], 'Similar to games you play' );
			if ( $Spotlight )
			{
				$Element.append( $Spotlight );
				rgGamesShown.push( rgRecommendedSpotlightOptions[1] );
			}
		}

		$Element.append( $J('<div/>', {'style': 'clear: both;' } ) );

		// remove anything we showed here from the main cluster rotation
		for ( var i = GHomepage.rgRecommendedGames.length - 1; i >= 0; i-- )
		{
			if ( rgGamesShown.indexOf( GHomepage.rgRecommendedGames[i].appid ) != -1 )
			{
				GHomepage.rgRecommendedGames.splice( i, 1 );
			}
		}

		GDynamicStore.DecorateDynamicItems( $Element );
	},

	RenderRecommendedSpotlight: function( unAppID, strDescription, bNoDSFlag )
	{
		var $SpotlightCtn = $J('<div/>', {'class': 'recommended_spotlight_ctn' } );

		var params = { 'class': 'recommended_spotlight' };
		var rgItemData = GStoreItemData.GetCapParams( 'recommended_spotlight', unAppID, null, params );

		if ( !rgItemData )
			return null;

		var strHeaderURL = rgItemData.header;
		if ( !strHeaderURL )	// wishlist items may not have a header loaded
			strHeaderURL = 'https://steamcdn-a.akamaihd.net/steam/apps/' + unAppID + '/header.jpg';

		var $Spotlight = $J('<a/>', params );
		GStoreItemData.BindHoverEvents( $Spotlight, unAppID );
		$Spotlight.append( $J('<div/>', {'class': 'recommended_spotlight_cap'}).append( $J('<img/>', {src: strHeaderURL } ) ) );
		$Spotlight.append( $J('<div/>', {'class': 'recommended_spotlight_desc'} ).text( strDescription ) );
		$Spotlight.append( $J('<div/>', {'class': 'recommended_spotlight_price' }).html( rgItemData.discount_block ? $J(rgItemData.discount_block).addClass('discount_block_spotlight discount_block_large') : '&nbsp;' ) );
		$Spotlight.append( $J('<div/>', {'style': 'clear: both;' } ) );

		$SpotlightCtn.append(
			$Spotlight
		);
		return $SpotlightCtn;
	},

	RenderMarketingMessages: function(  )
	{
		var rgMessages = GHomepage.rgMarketingMessages;
		var rgFilteredMessages = [];

		if( !rgMessages || !rgMessages.length )
			return;


		var $MessagesContainer = $J('.marketingmessage_area .marketingmessage_container');

		// Filter messages
		for( var i=0; i<rgMessages.length; i++)
		{
			var message = rgMessages[i];
			if( message.must_own_appid && !GDynamicStore.BIsAppOwned( message.must_own_appid ) )
				continue;

			if( message.must_not_own_appid && GDynamicStore.BIsAppOwned( message.must_not_own_appid ) )
				continue;

			if( message.must_own_packageid && !GDynamicStore.BIsPackageOwned( message.must_own_packageid ) )
				continue;

			if( message.must_not_own_packageid && GDynamicStore.BIsPackageOwned( message.must_not_own_packageid ) )
				continue;

			// We don't have this data handy so fall back to ownership for now
			if( message.must_have_launched_appid && !GDynamicStore.BIsAppOwned( message.must_have_launched_appid ) )
				continue;

			rgFilteredMessages.push(message);
		}


		var rgLayout = [ 'big','2small', '2small', '2small'];


		if( rgFilteredMessages.length < 5 )
			rgLayout = [ 'big', 'big','2small'];


		var j=0;
		for( var i=0; i<rgFilteredMessages.length; i++)
		{
			var params = {};

			if( j >= rgLayout.length )
				break;

			if( rgLayout[j] == 'big' )
			{
				var message = rgFilteredMessages[i];

				var rgItemData = GStoreItemData.GetCapParams ( 'marketingmessage', message.appid, message.packageid, params );

				var $MessageCtn = $J ( '<a/>', { 'class': 'home_marketing_message' } ).attr ( 'href', message.url );

				var $MessageImg = $J ( '<span/>' ).css ( { 'background-image': 'url(' + message.image + ')' } );


				$MessageCtn.append ( $MessageImg );
				if ( rgItemData )
					$MessageCtn.append ( $J ( '<div/>' ).html ( rgItemData.discount_block ? $J ( rgItemData.discount_block ).addClass ( 'discount_block_inline' ) : '&nbsp;' ) );
				else
					$MessageCtn.append ( $J ( '<div/>' ).addClass ( 'discount_block discount_block_inline' ).append ( $J ( '<div/>' ).addClass ( 'discount_final_price' ).html ( message.title ? message.title : '&nbsp;' ) ) );

				$MessagesContainer.append($MessageCtn);

			} else if( rgLayout[j] == '2small')
			{
				var k = i+2;
				for( ; i < k && i < rgFilteredMessages.length; i++)
				{
					var message = rgFilteredMessages[i];

					var rgItemData = GStoreItemData.GetCapParams ( 'marketingmessage', message.appid, message.packageid, params );

					var $MessageCtn = $J ( '<a/>', { 'class': 'home_marketing_message small' } ).attr ( 'href', message.url );

					var $MessageImg = $J ( '<span/>' ).css ( { 'background-image': 'url(' + message.image + ')' } );


					$MessageCtn.append ( $MessageImg );
					if ( rgItemData )
						$MessageCtn.append ( $J ( '<div/>' ).html ( rgItemData.discount_block ? $J ( rgItemData.discount_block ).addClass ( 'discount_block_inline' ) : '&nbsp;' ) );
					else
						$MessageCtn.append ( $J ( '<div/>' ).addClass ( 'discount_block discount_block_inline' ).append ( $J ( '<div/>' ).addClass ( 'discount_final_price' ).html ( message.title ? message.title : '&nbsp;' ) ) );

					$MessagesContainer.append ( $MessageCtn );
				}
				// Loop will increment one more time than we want it to, so decrement to fix the outer loop.
				i--;


			}

			j++;
		}

		$J('.marketingmessage_area').show();

	}
};

function CHomeSettings( strSectionName, fnOnSettingsChange )
{
	this.m_strSectionName = strSectionName;
	this.m_ApplicableSettings = GHomepage.oApplicableSettings[strSectionName];
	this.m_Settings = GHomepage.oSettings[strSectionName];
	this.m_fnOnSettingsChange = fnOnSettingsChange;

	this.m_$ActiveBtn = null;
	this.m_$Popup = null;
}

CHomeSettings.prototype.RenderCustomizeButton = function()
{
	var $Btn = $J('<div/>', {'class': 'home_btn home_customize_btn' } ).text( 'Customize' );
	$Btn.click( $J.proxy( this.DisplayPopup, this, $Btn ) );
	return $Btn;
};

CHomeSettings.prototype.DisplayPopup = function( $Btn )
{
	if ( this.m_$Popup )
		return;

	this.m_$ActiveBtn = $Btn;

	this.m_$ActiveBtn.addClass( 'active' );

	this.m_$Popup = $J('<div/>', {'class': 'home_viewsettings_popup' } );
	this.m_$Popup.append( $J('<div/>', {'class': 'home_viewsettings_instructions' } ).text( 'Select the types of products that you wish to see in this section' ) );

	if ( this.m_ApplicableSettings.popular_new_releases )
		this.m_$Popup.append( this.RenderCheckbox( 'popular_new_releases', 'Popular New Releases' ) );
	if ( this.m_ApplicableSettings.top_sellers )
		this.m_$Popup.append( this.RenderCheckbox( 'top_sellers', 'Top Sellers' ) );
	if ( this.m_ApplicableSettings.early_access )
		this.m_$Popup.append( this.RenderCheckbox( 'early_access', 'Early Access Products' ) );
	if ( this.m_ApplicableSettings.games_already_in_library )
		this.m_$Popup.append( this.RenderCheckbox( 'games_already_in_library', 'Games already in your account' ) );
	if ( this.m_ApplicableSettings.games_not_in_library )
		this.m_$Popup.append( this.RenderCheckbox( 'games_not_in_library', 'Games not in your account' ) );
	if ( this.m_ApplicableSettings.recommended_for_you )
		this.m_$Popup.append( this.RenderCheckbox( 'recommended_for_you', 'Recommended For You' ) );
	if ( this.m_ApplicableSettings.prepurchase )
		this.m_$Popup.append( this.RenderCheckbox( 'prepurchase', 'Prepurchase' ) );
	if ( this.m_ApplicableSettings.games )
		this.m_$Popup.append( this.RenderCheckbox( 'games', 'Games' ) );
	if ( this.m_ApplicableSettings.software )
		this.m_$Popup.append( this.RenderCheckbox( 'software', 'Software' ) );
	if ( this.m_ApplicableSettings.dlc_for_you )
		this.m_$Popup.append( this.RenderCheckbox( 'dlc_for_you', 'DLC for your games & software' ) );
	if ( this.m_ApplicableSettings.recently_viewed )
		this.m_$Popup.append( this.RenderCheckbox( 'recently_viewed', 'Products you\'ve recently viewed' ) );
	if ( this.m_ApplicableSettings.new_on_steam )
		this.m_$Popup.append( this.RenderCheckbox( 'new_on_steam', 'New On Steam' ) );
	if ( this.m_ApplicableSettings.dlc )
		this.m_$Popup.append( this.RenderCheckbox( 'dlc', 'Downloadable Content' ) );
	if ( this.m_ApplicableSettings.video )
		this.m_$Popup.append( this.RenderCheckbox( 'video', 'Videos' ) );
	if ( this.m_ApplicableSettings.localized )
		this.m_$Popup.append( this.RenderCheckbox( 'localized', 'Games in my language' ) );
	if ( this.m_ApplicableSettings.virtual_reality )
		this.m_$Popup.append( this.RenderCheckbox( 'virtual_reality', 'Virtual Reality' ) );
		
	if ( this.m_ApplicableSettings.only_current_platform )
	{
		// this one is a little magic
		if ( GDynamicStore.s_bUserOnLinux )
			this.m_$Popup.append( this.RenderCheckbox( 'only_current_platform', 'Available for Linux/SteamOS' ) );
		else if ( GDynamicStore.s_bUserOnMacOS )
			this.m_$Popup.append( this.RenderCheckbox( 'only_current_platform', 'Available for Mac' ) );
	}

	var nOffsetTop = $Btn.position().top + $Btn.outerHeight();
	var nOffsetRight = $Btn.position().left + $Btn.outerWidth( true );

	this.m_$Popup.css( 'top', nOffsetTop + 'px' );

	$Btn.parent().append( this.m_$Popup );

	this.m_$Popup.css( 'left', ( nOffsetRight - this.m_$Popup.outerWidth() ) + 'px' );

	var _this = this;
	window.setTimeout( function() {
		$J(document).on( 'click.CHomeSettings', function( event ) {
			if ( !_this.m_$Popup.has( event.target).length && !_this.m_$Popup.is( event.target ) )
				_this.DismissPopup();
		}).on( 'keyup.CHomeSettings', function( event ) {
			if ( event.which == 27 )
				_this.DismissPopup();
		});
	}, 1 );
};

CHomeSettings.prototype.RenderCheckbox = function( strSettingName, strDisplayLabel )
{
	var $Row = $J('<div/>', {'class': 'home_viewsettings_checkboxrow ellipsis' } );

	if ( this.m_ApplicableSettings[strSettingName] == 'always' )
		$Row.addClass( 'disabled' );

	var $Checkbox = $J('<div/>', {'class': 'home_viewsettings_checkbox' } );
	if ( this.m_Settings[strSettingName] || this.m_ApplicableSettings[strSettingName] == 'always' )
		$Checkbox.addClass('checked');

	var $Label = $J('<div/>', {'class': 'home_viewsettings_label'} ).text( strDisplayLabel );

	$Row.append( $Checkbox, $Label );

	if ( this.m_ApplicableSettings[strSettingName] != 'always' )
	{
		$Row.click( $J.proxy( this.OnCheckboxToggle, this, strSettingName, $Checkbox ) );
	}

	return $Row;
};

CHomeSettings.prototype.OnCheckboxToggle = function( strSettingName, $Checkbox )
{
	var bEnabled = $Checkbox.hasClass( 'checked' );

	if ( bEnabled )
		$Checkbox.removeClass( 'checked' );
	else
		$Checkbox.addClass( 'checked' );

	this.m_Settings[strSettingName] = !bEnabled;

	var _this = this;
	$J.post( 'https://store.steampowered.com/dynamicstore/updatehomeviewsettings', {
		sessionid: g_sessionID,
		section: this.m_strSectionName,
		settings: V_ToJSON( this.m_Settings )
	}).done( function () {
		_this.m_fnOnSettingsChange();
		GHomepage.PersistSettings();
	}).fail( function() {
		_this.DismissPopup();
		_this.m_Settings[strSettingName] = bEnabled;	// revert
		ShowAlertDialog( 'Customize', 'There was a problem saving your preferences.  Please try again later.' );
	} );
};

CHomeSettings.prototype.DismissPopup = function()
{
	this.m_$Popup.remove();
	this.m_$Popup = null;
	this.m_$ActiveBtn.removeClass( 'active' );
	$J(document).off( 'click.CHomeSettings' ).off( 'keyup.CHomeSettings' );
};


function GetAvatarURL( strAvatarHash, sizeStr )
{
	return 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/' + strAvatarHash.substr( 0 , 2 ) + '/' + strAvatarHash + sizeStr + '.jpg';
}

function GetScreenshotURL( appid, filename )
{
	return 'https://steamcdn-a.akamaihd.net/steam/' + 'apps/' + appid + '/' + filename;
}

GSteamCurators = {
	rgAppsRecommendedByCurators: [],
	rgSteamCurators: [],

	Init: function( rgSteamCurators, rgApps )
	{
		GSteamCurators.rgSteamCurators = rgSteamCurators;
		GSteamCurators.rgAppsRecommendedByCurators = rgApps;

		GSteamCurators.Render();
	},

	BuildHomePageHeaderCap: function( strFeatureContext, oItem )
	{
		var unAppID = oItem.appid;
		var unPackageID = 0;
		var params = { 'class': 'curated_app_link' };
		var rgItemData = GStoreItemData.GetCapParams( strFeatureContext, unAppID, unPackageID, params );
		if ( !rgItemData )
			return null;

		var $Item = $J('<div/>', {'class': 'curated_app_item'} );
		GStoreItemData.BindHoverEvents( $Item, unAppID, unPackageID );

		// href
		var $CapCtn = $J('<a/>', params );
		$Item.append( $CapCtn );

		// app image
		var $Image = $J('<img/>', { src: rgItemData.headerv5 } );
		$CapCtn.append( $Image );

		// show up to 3 curators per app
		var curatorsCache = GSteamCurators.rgAppsRecommendedByCurators.curators;
		var $Curators = $J('<div/>', {'class': 'curated_app_curators'} );
		var numCuratorsAdded = 0;
		for ( var j = 0; j < oItem.rgCurators.length && numCuratorsAdded < 3; ++j )
		{
			var clanID = oItem.rgCurators[j];
			if ( curatorsCache.hasOwnProperty( clanID ) )
			{
				var curator = curatorsCache[clanID];
				var $Curator =  $J('<div/>', {'class': 'steam_curator_for_app tooltip', 'onclick': "top.location.href='" + curator.link + "'", "data-tooltip-content": curator.name } );
				var $CuratorImg = $J('<img/>', {'class': 'steam_curator_for_app_img', 'src': GetAvatarURL( curator.strAvatarHash, '' ) });
				$Curator.append( $CuratorImg );
				$Curator.v_tooltip();

				$Curators.append( $Curator );
				++numCuratorsAdded;
			}
		}
		$Curators.append( $J('<div/>', {'style': 'clear: left'} ) );
		$Item.append( $Curators );

		// pricing info
		$CapCtn.append( $J('<div/>', {'class': 'home_headerv5_title ellipsis' } ).html( rgItemData.name ) );
		$CapCtn.append( $J('<div/>').html( rgItemData.discount_block ? $J(rgItemData.discount_block).addClass('discount_block_inline') : '&nbsp;' ) );

		return $Item;
	},

	BuildHomePageGenericCap: function( strFeatureContext, oItem )
	{
		var unAppID = oItem.appid;
		var unPackageID = 0;
		var params = { 'class': 'store_capsule' };
		var rgItemData = GStoreItemData.GetCapParams( strFeatureContext, unAppID, unPackageID, params );
		if ( !rgItemData )
			return null;

		var $Item = $J('<a/>', params );
		GStoreItemData.BindHoverEvents( $Item, unAppID, unPackageID );


		// app image
		// app image anchor

		var $CapCtn = $J('<a/>', params );
		GStoreItemData.BindHoverEvents( $CapCtn, unAppID, unPackageID );

		var $ImgCtn = $J('<div class="capsule headerv5"/>');

		$ImgCtn.append( $J('<img/>', { src: rgItemData.headerv5 } ) );
		$CapCtn.append( $ImgCtn );

		$Item.append( $CapCtn );

		// show up to 3 curators per app
		var curatorsCache = GSteamCurators.rgAppsRecommendedByCurators.curators;
		var $Curators = $J('<div/>', {'class': 'curated_app_curators'} );
		var numCuratorsAdded = 0;
		for ( var j = 0; j < oItem.rgCurators.length && numCuratorsAdded < 3; ++j )
		{
			var clanID = oItem.rgCurators[j];
			if ( curatorsCache.hasOwnProperty( clanID ) )
			{
				var curator = curatorsCache[clanID];
				var $Curator =  $J('<a/>', {'class': 'steam_curator_for_app tooltip', 'href': curator.link, "data-tooltip-content": curator.name } );
				var $CuratorImg = $J('<img/>', {'class': 'steam_curator_for_app_img', 'src': GetAvatarURL( curator.strAvatarHash, '' ) });
				$Curator.append( $CuratorImg );
				$Curator.v_tooltip();

				$Curators.append( $Curator );
				++numCuratorsAdded;
			}
		}
		$Curators.append( $J('<div/>', {'style': 'clear: left'} ) );
		$Item.append( $Curators );

		// pricing info
		$Item.append( $J('<div/>').html( rgItemData.discount_block ? $J(rgItemData.discount_block).addClass('discount_block_inline') : '&nbsp;' ) );

		return $Item;
	},

	BuildHomePageGiantCap: function( strFeatureContext, oItem )
	{
		var unAppID = oItem.appid;
		var unPackageID = 0;
		var params = { 'class': 'curator_giant_capsule' };
		var rgItemData = GStoreItemData.GetCapParams( strFeatureContext, unAppID, unPackageID, params );
		var rgItemExtemdedData = GHomepage.rgCuratorExtendedAppData[ unAppID ];
		if ( !rgItemData || !rgItemExtemdedData )
			return null;

		var $Item = $J('<a/>', params );
		GStoreItemData.BindHoverEvents( $Item, unAppID, unPackageID );

		// container

		// app image
		// app image anchor
		var $ImageCapsule= $J ('<div/>'  );
		$ImageCapsule.addClass('capsule');
		var $Image = $J('<img/>', { src: rgItemExtemdedData.maincap } );
		$Image.bind('error', function(){
			$Image.attr('src', rgItemData.headerv5  );
			$Image.css({'width': '470px'  });
		});
		$ImageCapsule.append( $Image );
		$ImageCapsule.append( $J('<div/>').html( rgItemData.discount_block ? $J(rgItemData.discount_block).addClass('discount_block_large main_cap_discount') : '&nbsp;' ) );

		$Item.append( $ImageCapsule );

		var $ScreenshotCtn = $J('<div/>',{'class':'screenshots'});

		// Add four screenshots
		for( var i=0; i<4; i++)
		{
			var screenshot = rgItemExtemdedData.screenshots[i];

			$ScreenshotCtn.append( $J('<div>', {'class': 'screenshot'}).css({'background-image': 'url(' + GetScreenshotURL( unAppID, screenshot.filename ) + ')' } ) );
		}

		$Item.append($ScreenshotCtn);


		// Add the curator block
		var curatorsCache = GSteamCurators.rgAppsRecommendedByCurators.curators;
		var $CuratorBlock = $J('<div/>', {'class': 'curator_block'} );

		var clanID = oItem.rgCurators[0];
		if ( curatorsCache.hasOwnProperty( clanID ) )
		{
			var curator = curatorsCache[clanID];
			// Add the image
			var $Curator =  $J('<a/>', {'class': 'tooltip', 'href': curator.link, "data-tooltip-content": curator.name } );
			var $CuratorImg = $J('<img/>', {'class': '', 'src': GetAvatarURL( curator.strAvatarHash, '_full' ) });
			$Curator.append( $CuratorImg );
			$Curator.v_tooltip();

			// Now the text blurb
			var $CuratorTextCtn = $J('<div/>',{class:'blurb'});
			var $CuratorText = $J('<span/>').text( rgItemExtemdedData.blurb  );

			$CuratorTextCtn.append( $CuratorText );

			$CuratorBlock.append( $Curator );
			$CuratorBlock.append( $CuratorTextCtn );
		}

		$Item.append( $CuratorBlock );

		return $Item;
	},

	BuildCuratorItem: function( curator )
	{
		var $Item = $J('<div/>', {'class': 'steam_curator', 'onclick': "top.location.href='" + curator.link + "'" } );
		var $Img = $J('<img/>', {'class': 'steam_curator_img', 'src': GetAvatarURL( curator.strAvatarHash, '_medium' ) });
		$Item.append( $Img );
		$Item.append( $J('<div/>', {'class': 'steam_curator_name' } ).text( curator.name ) );
		if ( curator.curator_description )
		{
			$Item.append( $J('<div/>', {'class': 'steam_curator_desc' } ).text( curator.curator_description ) );
		}
		$Item.append( $J('<div/>', {'style': 'clear: left;' } ) );

		return $Item;
	},

	Render: function()
	{
		$J('.steam_curators_ctn').hide();
		$J('.apps_recommended_by_curators_ctn').hide();

		if( $J('#apps_recommended_by_curators').children().length > 0 )
			return;

		$J('#apps_recommended_by_curators').empty();
		$J('#steam_curators').children('.steam_curator' ).remove();

		// if there are apps, then show them
		var bShowApps = 1;
		if ( bShowApps && GSteamCurators.rgAppsRecommendedByCurators && GSteamCurators.rgAppsRecommendedByCurators.length != 0 &&
			 GSteamCurators.rgAppsRecommendedByCurators.apps.length != 0 )
		{
			var apps = GSteamCurators.rgAppsRecommendedByCurators.apps;

						var rgRecommendedApps = GHomepage.FilterItemsForDisplay(
				apps, 'curators', 4, 8
			);
			
			GDynamicStore.MarkAppDisplayed( rgRecommendedApps );

			if ( rgRecommendedApps.length >= 5 )
			{
				// v1
				$J('.apps_recommended_by_curators_ctn').show();
				var $RecommendedApps = $J('#apps_recommended_by_curators');

				for ( var i = 0; i < rgRecommendedApps.length; i++ )
				{
					var oItem = rgRecommendedApps[i];
					var $Item = GSteamCurators.BuildHomePageHeaderCap( 'curated_app', oItem );
					if ( $Item )
					{
						$RecommendedApps.append( $Item );
					}
				}
				$RecommendedApps.InstrumentLinks();
				$RecommendedApps.trigger('v_contentschanged');	// update our horizontal scrollbars if needed
				GDynamicStore.DecorateDynamicItems( $RecommendedApps );

				// v2
				$J('.apps_recommended_by_curators_ctn').show();
				var $RecommendedApps = $J('#apps_recommended_by_curators_v2');

				if( $RecommendedApps.children().length > 0 )
					return;

				// First show the giant cap
				var nGiantCapAppId = 0;
				for( var j=0; j<rgRecommendedApps.length; j++ in rgRecommendedApps )
				{
					var appid = rgRecommendedApps[j].appid;
					if( !GHomepage.rgCuratorExtendedAppData[appid] )
						continue;
					// Find the item info in the unfiltered apps list
					var oItem = false;
					for( var i=0; i < apps.length; i++ )
					{
						if( apps[i].appid == appid )
						{
							oItem = apps[i];
							break;
						}
					}

					if( !oItem )
						continue;

					nGiantCapAppId = appid;
					$J('.giant_curator_capsule').show();
					var $Item = GSteamCurators.BuildHomePageGiantCap( 'curated_main_app', oItem );
					$J('.giant_curator_capsule').empty().append($Item);

					var $elButtonWishlist = $J('<span />').text("Add to Wishlist");

					$elButtonWishlist.click(function(){
						GDynamicStore.ModifyWishlist( appid, false, function(){ $elButtonWishlist.hide(); return false; } );
					});

					//var $elButtonFollow = $J('<a />').text("Follow");

					var $elButtonNotInterested = $J('<span />').text("Not Interested");

					$elButtonNotInterested.click(function(){
						$J('.giant_curator_capsule').css({'opacity': 0.3});
						GDynamicStore.ModifyIgnoredApp( appid, false, function(){ $elButtonNotInterested.hide();  return false; } );
					});

					if( !GDynamicStore.BIsAppOnWishlist(appid) )
						$J('.giant_curator_controls').append( $elButtonWishlist );

					//if( !GDynamicStore.BisAp(appid)
					//	$J('.giant_curator_controls').append( $elButtonFollow );

					if( !GDynamicStore.BIsAppIgnored(appid ) ) // Shouldn't ever need to check this here, but sure why not?
						$J('.giant_curator_controls').append( $elButtonNotInterested );

					break;
				}

				for ( var i = 0; i < rgRecommendedApps.length; i++ )
				{
					var oItem = rgRecommendedApps[i];
					if( oItem.appid == nGiantCapAppId )
						continue;

					var $Item = GSteamCurators.BuildHomePageGenericCap( 'curated_app', oItem );
					if ( $Item )
					{
						$RecommendedApps.append( $Item );
					}
				}
				$RecommendedApps.InstrumentLinks();
				$RecommendedApps.trigger('v_contentschanged');	// update our horizontal scrollbars if needed
				GDynamicStore.DecorateDynamicItems( $RecommendedApps );

				return;
			}
		}

		$J('.steam_curators_ctn').show();
		// if no apps, then curators
		if ( GSteamCurators.rgSteamCurators && GSteamCurators.rgSteamCurators.length != 0 )
		{
			$J('#steam_curators_not_empty').show();
			var $Curators = $J('#steam_curators');

			for ( var i = 0; i < GSteamCurators.rgSteamCurators.length; i++ )
			{
				var curator = GSteamCurators.rgSteamCurators[i];

				var $Item = GSteamCurators.BuildCuratorItem( curator );
				$Curators.append( $Item );
			}
		}
		else
		{
			$J('#steam_curators_not_empty').hide();
			$J('#steam_curators_empty').show();
		}
	}
};

function srand(nSeed)
{
	this.nModulus = 0x80000000;
	this.nMultiplier = 1103515245;
	this.nIncrement = 12345;

	this.nLast = nSeed ? nSeed : Math.floor(Math.random() * (this.nModulus-1));
};
srand.prototype.nextInt = function()
{
	this.nLast = (this.nMultiplier * this.nLast + this.nIncrement) % this.nModulus;
	return this.nLast;
};
srand.prototype.nextFloat = function()
{
	return this.nextInt() / (this.nModulus - 1);
};
srand.prototype.nextIntBetween = function(nStart, nEnd)
{
	var nRangeSize = nEnd - nStart;
	var fRand = this.nextInt() / this.nModulus;
	return nStart + Math.floor(fRand * nRangeSize);
};
srand.prototype.choice = function(rgOptions)
{
	return rgOptions[this.nextIntIn(0, rgOptions.length)];
};

var bAutoLoaderReady = false;
var g_bDisableAutoloader = false;

(function ( $ ) {

	$.fn.autoloader = function( options ) {
		var settings = $.extend({
			triggerStart: 0,
			template_url: false,
			recommendations_url: false,
			additional_url: false
		}, options );



		return this.each(function( i, ele ) {

			ele.indices = {chunks: 0};

			var offset = $(ele).offset();
			this.nNextTrigger = $(ele).height() + offset.top - 750;

			ele.bTriggerActive = false;
			ele.tagIndex = 0;
			ele.nRecommendedDataIndex = 0;
			ele.rgSeenApps = [];


			var loadFunc = function() {
				ele = this;

				if( this.bTriggerActive || g_bDisableAutoloader )
				{
					return;
				}

				this.bTriggerActive = true;

				if( this.rgRecommendedData )
				{
					$(this).show();

					// Main cap

					var nItems = 0;
					while( nItems < 2 && this.rgRecommendedData.tags.length > 0 )
					{
						var rgMainCap = {
							tagid: this.rgRecommendedData.tags[this.nRecommendedDataIndex].tagid,
							tagname: this.rgRecommendedData.tags[this.nRecommendedDataIndex].tagname,
							items: []
						};

						nItems = 0;

						while( nItems < 2 && this.rgRecommendedData.tags[this.nRecommendedDataIndex].items.length > 0)
						{
							var nAppId = this.rgRecommendedData.tags[this.nRecommendedDataIndex].items.shift();
							if( !GDynamicStore.BIsAppOwned( nAppId ) && !GDynamicStore.BIsAppIgnored( nAppId ) && this.rgSeenApps.indexOf( nAppId ) === -1 )
							{
								rgMainCap.items.push(nAppId);
								nItems++;
								this.rgSeenApps.push(nAppId);
							}
						}

						// If we can't fill the bucket, remove it.
						if( nItems < 2 )
						{
							this.rgRecommendedData.tags.splice(this.nRecommendedDataIndex,1);
							this.nRecommendedDataIndex = ( this.nRecommendedDataIndex + 1 ) % this.rgRecommendedData.tags.length;
						}
					}

					if( nItems < 2 )
					{
						$('#content_out').show();
						$('#LoadingContent').hide();
						return;
					}

					this.nRecommendedDataIndex = ( this.nRecommendedDataIndex + 1 ) % this.rgRecommendedData.tags.length;

					// Secondary cap

					nItems = 0;
					while( nItems < 4 && this.rgRecommendedData.tags.length > 0 )
					{
						var rgSubCap = {
							tagid: this.rgRecommendedData.tags[this.nRecommendedDataIndex].tagid,
							tagname: this.rgRecommendedData.tags[this.nRecommendedDataIndex].tagname,
							items: []
						};

						nItems = 0;
						while( nItems < 4 && this.rgRecommendedData.tags[this.nRecommendedDataIndex].items.length > 0)
						{
							var nAppId = this.rgRecommendedData.tags[this.nRecommendedDataIndex].items.shift();
							if( !GDynamicStore.BIsAppOwned( nAppId ) && !GDynamicStore.BIsAppIgnored( nAppId ) && this.rgSeenApps.indexOf( nAppId ) === -1 )
							{
								rgSubCap.items.push(nAppId);
								nItems++;
								this.rgSeenApps.push(nAppId);
							}
						}

						// If we can't fill the bucket, remove it.
						if( nItems < 4 )
						{
							this.rgRecommendedData.tags.splice(this.nRecommendedDataIndex,1);
							this.nRecommendedDataIndex = ( this.nRecommendedDataIndex + 1 ) % this.rgRecommendedData.tags.length;
						}
					}

					if( nItems < 4 )
					{
						$('#content_out').show();
						$('#LoadingContent').hide();
						return;
					}

					this.nRecommendedDataIndex = ( this.nRecommendedDataIndex + 1 ) % this.rgRecommendedData.tags.length;

					var nItems = 0;
					var rgSimilarItems = [];
					var rgBuckets = ['played', 'friends', 'wishlist', 'curators'];
					while( rgSimilarItems.length < 3 && rgBuckets.length > 0 )
					{
						var nIndex = ele.srand.nextIntBetween(0,rgBuckets.length);
						WebStorage.SetLocal('home_seed',ele.srand.nLast, true );
						$('#content_seed').val(ele.srand.nLast);
						var strBucket = rgBuckets[nIndex];
						if( this.rgRecommendedData[strBucket].length == 0 )
						{
							rgBuckets.splice( nIndex, 1 );
							continue;
						}

						var rgItem = this.rgRecommendedData[strBucket].shift();

						// Don't show items similar to ones I'm ignoring
						if( ( strBucket == 'recent' || strBucket == 'curators' || strBucket == 'friends' ) && GDynamicStore.BIsAppIgnored( rgItem.appid ) )
							continue;

						// Don't recommend items I already own
						if( ( strBucket == 'curators' || strBucket == 'friends' ) && GDynamicStore.BIsAppOwned( rgItem.appid ) )
							continue;

						var rgItem = {
							type: strBucket,
							appid: rgItem.appid
						};
						rgSimilarItems.push(rgItem);

					}

					this.bTriggerActive = true;

					$('#content_loading').show();

					var jqxhr = $.ajax( {
						url: settings.template_url,
						data: {
							main: rgMainCap,
							sub: rgSubCap,
							similar: rgSimilarItems
						},
						//dataType: 'json',
						type: 'GET'
					}).done(function( data ) {
						ele.index++;
						var newElement = $(data);

						GDynamicStore.DecorateDynamicItems(newElement);

						$('.gamelink.ds_owned', newElement).parent().parent().hide();

						$('*[data-ds-appid]', newElement).each(function(index, e){
							var nAppId = $(e).data('ds-appid');
							if( ele.rgSeenApps.indexOf( nAppId ) === -1 )
							{
								ele.rgSeenApps.push( nAppId );
							} else {
								if( $(e).hasClass('gamelink') )
									$(e).parent().parent().hide();
							}
							// If we're going to recommend this game later, skip it for now.
							for( var i=0; i < ele.rgRecommendedData['friends'].length - 1; i++ )
							{
								if( nAppId == ele.rgRecommendedData['friends'][i].appid )
								{
									if( $(e).hasClass('gamelink') )
									{
										$(e).parent().parent().hide();
										ele.rgSeenApps.splice( ele.rgSeenApps.indexOf( nAppId ), 1 );
									}
								}
							}
							if( GDynamicStore.BIsAppIgnored( nAppId ) )
							{
								if( $(e).hasClass('gamelink') )
									$(e).parent().parent().hide();
							}
						});
						$(ele).append(newElement);
						ele.bTriggerActive = false;

						var nCurrentScroll = $(window).scrollTop() + $(window).height();
						ele.nNextTrigger = $(ele).height() + offset.top - 750;
						if(nCurrentScroll > ele.nNextTrigger)
						{
							loadFunc.apply(ele);
						}

					}).always(function() {
						$('#content_loading').hide();
						WebStorage.SetLocal('home_content',$(ele).html(), true);
						//WebStorage.SetLocal('home_seed',ele.nSeed, true );
						WebStorage.SetLocal('home_data',ele.rgRecommendedData, true );
						WebStorage.SetLocal('home_seen',ele.rgSeenApps, true );
						WebStorage.SetLocal('home_index',ele.nRecommendedDataIndex, true );
					});
				} else {
					this.bTriggerActive = true;
					$('#content_loading').show();

					if( $('#content_seed').val() == WebStorage.GetLocal('home_seed', true ) )
					{
						// Clean out any pesky script tags that might have found their way into LS
						var wrapped = $J("<div>" + WebStorage.GetLocal('home_content', true ) + "</div>");
						wrapped.find('script').remove();

						$(this).html( wrapped.html() );
						ele.rgRecommendedData = WebStorage.GetLocal('home_data', true );
						ele.nRecommendedDataIndex = WebStorage.GetLocal('home_index', true );
						ele.nSeed = WebStorage.GetLocal('home_seed', true );
						ele.rgSeenApps = WebStorage.GetLocal('home_seen', true );
						ele.srand = new srand(ele.nSeed);
						$('#content_loading').hide();
						this.bTriggerActive = false;
						setTimeout(function(){ $J('html, body').scrollTop( WebStorage.GetLocal('home_scroll', true ) ) }, 250 );
						return;
					}

					var jqxhr = $.ajax( {
						url: settings.recommendations_url,
						dataType: 'json',
						type: 'GET'
					}).done(function( data ) {

						if( !data || data['tags'].length == 0 )
						{
							$J('#content_more').hide();
							$J('#content_loading').hide();
							$J('#content_callout').hide();
							$J('#content_none').show();
							return;
						}

						data['wishlist'] = [];
						for ( var unAppID in GDynamicStore.s_rgWishlist )
						{
							data['wishlist'].push({appid: unAppID});
						}

						ele.rgRecommendedData = data;
						ele.nSeed = data.seed;
						$('#content_seed').val(ele.nSeed);

						ele.srand = new srand(ele.nSeed);
						ele.bTriggerActive = false;

						loadFunc.apply(ele);

					}).fail( function(){
						$J('#content_more').hide();
						$J('#content_loading').hide();
						$J('#content_callout').hide();
						$J('#content_none').show();
						return;
					} );
				}

				bAutoLoaderReady = true;
			};

			var scrollFunc = function( event ){
				if ( g_bDisableAutoloader )
					return;

				if( bAutoLoaderReady )
					WebStorage.SetLocal('home_scroll',$(window).scrollTop(), true);

				var nCurrentScroll = $(window).scrollTop() + $(window).height();
				if(nCurrentScroll > this.nNextTrigger)
				{
					loadFunc.apply(this);
				}
			};

			$(document).scroll( function() { return scrollFunc.apply(ele) } );
			$(document).ready( function() { return scrollFunc.apply(ele) } );
		});

	};

}( jQuery ));


(function ( $ ) {

	$.fn.pagedautoloader = function( options ) {
		var settings = $.extend({
			triggerStart: 0,
			template_url: false
		}, options );



		return this.each(function( i, ele ) {

			ele.indices = {chunks: 0};

			var offset = $(ele).offset();
			this.nNextTrigger = $(ele).height() + offset.top - 750;

			ele.bTriggerActive = false;
			ele.tagIndex = 0;
			ele.nRecommendedDataIndex = 0;
			ele.rgSeenApps = [];
			ele.nPage = 0;
			ele.bMoreContent = true;


			var loadFunc = function() {
				ele = this;

				if( this.bTriggerActive || g_bDisableAutoloader )
				{
					return;
				}

				this.bTriggerActive = true;

				if( this.bMoreContent )
				{
					$(this).show();
					ele.nPage = ele.nPage + 1;

					this.bTriggerActive = true;

					$('#content_loading').show();

					var jqxhr = $.ajax( {
						url: settings.template_url,
						data: {
							page: this.nPage
						},
						type: 'GET'
					}).done(function( data ) {
						ele.index++;
						var newElement = $(data);

						GDynamicStore.DecorateDynamicItems(newElement);

						$(ele).append(newElement);
						ele.bTriggerActive = false;

						var nCurrentScroll = $(window).scrollTop() + $(window).height();
						ele.nNextTrigger = $(ele).height() + offset.top - 750;
						if(nCurrentScroll > ele.nNextTrigger)
						{
							loadFunc.apply(ele);
						}

					}).fail(function(){
						ele.bMoreContent = false;
					}).always(function() {
						$('#content_loading').hide();
					});
				}

				bAutoLoaderReady = true;
			};

			var scrollFunc = function( event ){
				if ( g_bDisableAutoloader )
					return;

				if( bAutoLoaderReady )
					WebStorage.SetLocal('home_scroll',$(window).scrollTop(), true);

				var nCurrentScroll = $(window).scrollTop() + $(window).height();
				if(nCurrentScroll > this.nNextTrigger)
				{
					loadFunc.apply(this);
				}
			};

			$(document).scroll( function() { return scrollFunc.apply(ele) } );
		});

	};

}( jQuery ));

function ScrollToDynamicContent()
{
	$J('html, body').animate({ scrollTop: $J("#homecontent_anchor").offset().top }, 200);
}

function TabSelectLast()
{
	var strLastValue = $J('#last_tab').val();
	if( strLastValue )
	{
		TabSelect( $J('#'+strLastValue+'_trigger')[0], strLastValue );
		LoadDelayedImages('home_tabs');
	}
}

function BeginDiscoveryQueue( eQueueType, eleAnchorTarget )
{
	WebStorage.SetCookie( 'queue_type', eQueueType );
	window.location = eleAnchorTarget.href;
}

jQuery( document ).ready(function( $ ) {
	TabSelectLast();
});


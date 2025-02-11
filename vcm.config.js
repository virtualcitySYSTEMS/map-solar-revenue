export default {
  appConfig: {
    modules: [
      {
        _id: 'fc1e46f8-8c02-40d3-a1f4-d83cc5bea19a',
        name: 'Solar Revenue',
        startingViewpointName: 'Viewpoint(1)',
        startingMapName: 'CesiumMap',
        maps: [
          {
            type: 'CesiumMap',
            name: 'CesiumMap',
          },
          {
            type: 'OpenlayersMap',
            name: 'OpenlayersMap',
          },
        ],
        layers: [
          {
            type: 'OpenStreetMapLayer',
            name: 'OpenStreetMapLayer(1)',
            properties: {
              attributions: {
                provider: 'OpenStreetMap contributors',
                url: 'http://www.openstreetmap.org/',
                year: '2023',
              },
            },
            activeOnStartup: true,
            zIndex: 0,
          },
          {
            type: 'CesiumTilesetLayer',
            name: 'SolarBuildings',
            properties: {
              featureInfo: 'myfeatureinfo',
            },
            activeOnStartup: true,
            url: '//publisher/datasource-data/5b9047ed-c197-4e1c-a3b3-1fec00af402e/tileset.json',
            extent: {
              coordinates: [
                11.76635736582883, 48.08715817035574, 11.799316361923273,
                48.109130815320114,
              ],
              projection: {
                type: 'Projection',
                epsg: 'EPSG:4326',
              },
              type: 'Extent',
            },
            datasourceId: '5b9047ed-c197-4e1c-a3b3-1fec00af402e',
            tilesetOptions: {
              useSRGBColorFactors: true,
            },
            zIndex: 0,
          },
        ],
        obliqueCollections: [],
        viewpoints: [
          {
            type: 'Viewpoint',
            name: 'Viewpoint(1)',
            distance: 477.98390228149606,
            cameraPosition: [
              11.789784011444409, 48.10241079801803, 420.09237260334373,
            ],
            groundPosition: [
              11.789623783509771, 48.10445854124979, -0.0010947819983989733,
            ],
            heading: 357,
            pitch: -61.50931253151307,
            roll: 360,
            animate: false,
          },
        ],
        styles: [],
        categories: [],
        uiConfig: [
          {
            name: 'logo',
            value:
              'https://upload.wikimedia.org/wikipedia/commons/b/b0/NewTux.svg',
          },
        ],
        featureInfo: [
          {
            type: 'TableFeatureInfoView',
            name: 'myfeatureinfo',
          },
        ],
        i18n: [],
        contentTree: [
          {
            type: 'LayerContentTreeItem',
            name: 'OpenStreetMapLayer(1)',
            layerName: 'OpenStreetMapLayer(1)',
          },
          {
            type: 'LayerContentTreeItem',
            name: 'SolarBuildings',
            layerName: 'SolarBuildings',
          },
          {
            type: 'ViewpointContentTreeItem',
            name: 'Viewpoint(1)',
            viewpointName: 'Viewpoint(1)',
          },
        ],
        plugins: [
          {
            name: '@vcmap-show-case/plugin-editors',
            entry: 'plugins/@vcmap-show-case/plugin-editors/index.js',
          },
          {
            name: '@vcmap/draw',
            version: '1',
            entry: 'plugins/@vcmap/draw/index.js',
          },
          {
            name: '@vcmap/project-selector',
            version: '1',
            entry: 'plugins/@vcmap/project-selector/index.js',
          },
          {
            name: '@vcmap/planning',
            serviceUrl: 'https://demo.virtualcityplanner.de/',
            projectId: 'rBW58EJz5RwCz75Q3',
            mapId: 'csunCGqmQE8Py4KCe',
            entry: 'plugins/@vcmap/planning/index.js',
          },
        ],
      },
    ],
  },
};

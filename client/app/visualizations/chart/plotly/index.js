import { each, debounce } from 'underscore';
import d3 from 'd3';

import Plotly from 'plotly.js/lib/core';
import bar from 'plotly.js/lib/bar';
import pie from 'plotly.js/lib/pie';
import histogram from 'plotly.js/lib/histogram';
import box from 'plotly.js/lib/box';

import {
  ColorPalette,
  prepareData,
  prepareLayout,
  calculateMargins,
  applyMargins,
  normalAreaStacking,
  percentAreaStacking,
  normalizeValue,
} from './utils';

Plotly.register([bar, pie, histogram, box]);
Plotly.setPlotConfig({
  modeBarButtonsToRemove: ['sendDataToCloud'],
});

const PlotlyChart = () => ({
  restrict: 'E',
  template: '<div class="plotly-chart-container" resize-event="handleResize()"></div>',
  scope: {
    options: '=',
    series: '=',
  },
  link(scope, element) {
    const plotlyElement = element[0].querySelector('.plotly-chart-container');
    const plotlyOptions = { showLink: false, displaylogo: false };
    let layout = {};
    let data = [];

    function update() {
      data = prepareData(scope.series, scope.options);
      layout = prepareLayout(plotlyElement, scope.series, scope.options, data);
      Plotly.purge(plotlyElement);
      Plotly.newPlot(plotlyElement, data, layout, plotlyOptions);
    }
    update();

    const applyAutoMargins = debounce(() => {
      if (applyMargins(layout.margin, calculateMargins(plotlyElement))) {
        Plotly.relayout(plotlyElement, layout);
      }
    }, 100);

    plotlyElement.on('plotly_afterplot', () => {
      applyAutoMargins();

      if (scope.options.globalSeriesType === 'area' && (scope.options.series.stacking === 'normal' || scope.options.series.stacking === 'percent')) {
        plotlyElement.querySelectorAll('.legendtoggle').forEach((rectDiv, i) => {
          d3.select(rectDiv).on('click', () => {
            const maxIndex = scope.data.length - 1;
            const itemClicked = scope.data[maxIndex - i];

            itemClicked.visible = (itemClicked.visible === true) ? 'legendonly' : true;
            if (scope.options.series.stacking === 'normal') {
              normalAreaStacking(scope.data);
            } else if (scope.options.series.stacking === 'percent') {
              percentAreaStacking(scope.data);
            }
            Plotly.redraw(plotlyElement);
          });
        });
      }
    });

    scope.$watch('series', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        update();
      }
    });
    scope.$watch('options', (oldValue, newValue) => {
      if (oldValue !== newValue) {
        update();
      }
    }, true);

    scope.handleResize = debounce(() => {
      layout = prepareLayout(plotlyElement, scope.series, scope.options, data);
      Plotly.relayout(plotlyElement, layout);
    }, 100);
    scope.handleResize();
  },
});

const CustomPlotlyChart = clientConfig => ({
  restrict: 'E',
  template: '<div class="plotly-chart-container" resize-event="handleResize()"></div>',
  scope: {
    series: '=',
    options: '=',
  },
  link(scope, element) {
    if (!clientConfig.allowCustomJSVisualizations) {
      return;
    }

    const refresh = () => {
      // Clear existing data with blank data for succeeding codeCall adds data to existing plot.
      Plotly.newPlot(element[0].firstChild);

      try {
        // eslint-disable-next-line no-new-func
        const codeCall = new Function('x, ys, element, Plotly', scope.options.customCode);
        codeCall(scope.x, scope.ys, element[0].children[0], Plotly);
      } catch (err) {
        if (scope.options.enableConsoleLogs) {
          // eslint-disable-next-line no-console
          console.log(`Error while executing custom graph: ${err}`);
        }
      }
    };

    const timeSeriesToPlotlySeries = () => {
      scope.x = [];
      scope.ys = {};
      each(scope.series, (series) => {
        scope.ys[series.name] = [];
        each(series.data, (point) => {
          scope.x.push(normalizeValue(point.x));
          scope.ys[series.name].push(normalizeValue(point.y));
        });
      });
    };

    scope.handleResize = () => {
      refresh();
    };

    scope.$watch('[options.customCode, options.autoRedraw]', () => {
      refresh();
    }, true);

    scope.$watch('series', () => {
      timeSeriesToPlotlySeries();
      refresh();
    }, true);
  },
});

export default function init(ngModule) {
  ngModule.constant('ColorPalette', ColorPalette);
  ngModule.directive('plotlyChart', PlotlyChart);
  ngModule.directive('customPlotlyChart', CustomPlotlyChart);
}

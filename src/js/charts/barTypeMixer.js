/**
 * @fileoverview barTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var predicate = require('../helpers/predicate');

/**
 * barTypeMixer is mixer of bar type chart(bar, column).
 * @mixin
 */
var barTypeMixer = {

    /**
     * Pick stacks.
     * @param {array.<{stack: string}>} rawSeriesData raw series data
     * @returns {array.<string>} stacks
     * @private
     */
    _pickStacks: function(rawSeriesData) {
        var stacks;

        stacks = tui.util.map(rawSeriesData, function(seriesDatum) {
            return tui.util.pick(seriesDatum, 'stack');
        });

        stacks = tui.util.filter(stacks, function(stack) {
            return !!stack;
        });

        stacks = tui.util.uniq(stacks);

        stacks.length = Math.min(stacks.length, 2);

        return stacks;
    },

    /**
     * Make minus values.
     * @param {array.<number>} data number data
     * @returns {Array} minus values
     * @private
     */
    _makeMinusValues: function(data) {
        return tui.util.map(data, function(value) {
            return value < 0 ? 0 : -value;
        });
    },

    /**
     * Make plus values.
     * @param {array.<number>} data number data
     * @returns {Array} plus values
     * @private
     */
    _makePlusValues: function(data) {
        return tui.util.map(data, function(value) {
            return value < 0 ? 0 : value;
        });
    },

    /**
     * Make normal divergent raw series data.
     * @param {{data: array.<number>}} rawSeriesData raw series data
     * @returns {{data: array.<number>}} changed raw series data
     * @private
     */
    _makeNormalDivergingRawSeriesData: function(rawSeriesData) {
        rawSeriesData.length = Math.min(rawSeriesData.length, 2);

        rawSeriesData[0].data = this._makeMinusValues(rawSeriesData[0].data);

        if (rawSeriesData[1]) {
            rawSeriesData[1].data = this._makePlusValues(rawSeriesData[1].data);
        }

        return rawSeriesData;
    },

    /**
     * Make stacked divergent raw series data.
     * @param {{data: array.<number>, stack: string}} rawSeriesData raw series data
     * @returns {{data: array.<number>}} changed raw series data
     * @private
     */
    _makeStackedDivergingRawSeriesData: function(rawSeriesData) {
        var result = [],
            stacks = this._pickStacks(rawSeriesData),
            leftStack = stacks[0],
            rightStack = stacks[1];

        tui.util.forEachArray(rawSeriesData, function(seriesDatum) {
            if (seriesDatum.stack === leftStack) {
                seriesDatum.data = this._makeMinusValues(seriesDatum.data);
                result.push(seriesDatum);
            } else if (seriesDatum.stack === rightStack) {
                seriesDatum.data = this._makePlusValues(seriesDatum.data);
                result.push(seriesDatum);
            }
        }, this);
        return result;
    },

    /**
     * Make raw series data for divergent.
     * @param {{data: array.<number>, stack: string}} rawSeriesData raw series data
     * @param {?string} stackedOption stacked option
     * @returns {{data: array.<number>}} changed raw series data
     * @private
     */
    _makeRawSeriesDataForDiverging: function(rawSeriesData, stackedOption) {
        if (predicate.isValidStackedOption(stackedOption)) {
            rawSeriesData = this._makeStackedDivergingRawSeriesData(rawSeriesData);
        } else {
            rawSeriesData = this._makeNormalDivergingRawSeriesData(rawSeriesData);
        }

        return rawSeriesData;
    },

    /**
     * Mix in.
     * @param {function} func target function
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = barTypeMixer;

/**
 * ------------------------------------------------------------
 * Suggest   自动提示
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Dropdown = require('../navigation/dropdown.js');
var template = require('./suggest.html');
var _ = require('../../ui-base/_.js');

/**
 * @class Suggest
 * @extend Dropdown
 * @param {object}                  options.data                     =  绑定属性
 * @param {object[]=[]}             options.data.source             <=> 数据源
 * @param {string}                  options.data.source[].name       => 每项的内容
 * @param {boolean=false}           options.data.source[].disabled   => 禁用此项
 * @param {object=null}             options.data.selected           <=> 当前选择项
 * @param {string=''}               options.data.value              <=> 文本框中的值
 * @param {string='请输入'}         options.data.placeholder         => 文本框的占位文字
 * @param {number}                  options.data.maxlength           => 文本框的最大长度
 * @param {number=0}                options.data.startLength         => 开始提示长度。当输入长度>=该值后开始提示
 * @param {string='all'}            options.data.matchType           => 匹配方式，`all`表示匹配全局，`start`表示只匹配开头，`end`表示只匹配结尾
 * @param {boolean=false}           options.data.strict              => 是否为严格模式。当为严格模式时，`value`属性必须在source中选择，否则为空。
 * @param {boolean=false}           options.data.autofocus           => 是否自动获得焦点
 * @param {string=null}             options.data.itemTemplate       @=> 单项模板
 * @param {boolean=false}           options.data.open               <=> 当前为展开/收起状态
 * @param {boolean=false}           options.data.readonly            => 是否只读
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {boolean=true}            options.data.visible             => 是否显示
 * @param {string=''}               options.data.class               => 补充class
 * @param {object}                  options.service                 @=> 数据服务
 */
var Suggest = Dropdown.extend({
    name: 'suggest',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            // @inherited source: [],
            // @inherited open: false,
            selected: null,
            value: '',
            placeholder: '请输入',
            maxlength: undefined,
            startLength: 0,
            delay: 300,
            matchType: 'all',
            strict: false,
            autofocus: false
        });
        this.supr();
    },
    /**
     * @method select(item) 选择某一项
     * @public
     * @param  {object} item 选择项
     * @return {void}
     */
    select: function(item) {
        if(this.data.readonly || this.data.disabled || item.disabled || item.divider)
            return;

        this.data.selected = item;
        this.data.value = item.name;

        /**
         * @event select 选择某一项时触发
         * @property {object} sender 事件发送对象
         * @property {object} selected 当前选择项
         */
        this.$emit('select', {
            sender: this,
            selected: item
        });
        this.toggle(false);
    },
    /**
     * @method toggle(open) 展开/收起
     * @public
     * @param  {boolean} open 展开/收起状态。如果无此参数，则在两种状态之间切换。
     * @return {void}
     */
    toggle: function(open, _isInput) {
        if(this.data.readonly || this.data.disabled)
            return;

        if(open === undefined)
            open = !this.data.open;
        this.data.open = open;

        var index = Dropdown.opens.indexOf(this);
        if(open && index < 0)
            Dropdown.opens.push(this);
        else if(!open && index >= 0) {
            Dropdown.opens.splice(index, 1);

            if(!_isInput && this.data.strict)
               this.data.value = this.data.selected ? this.data.selected.name : '';
        }

        /**
         * @event toggle  展开/收起时触发
         * @property {object} sender 事件发送对象
         * @property {object} open 展开/收起状态
         */
        this.$emit('toggle', {
            sender: this,
            open: open
        });
    },
    /**
     * @private
     */
    _onInput: function($event) {
        var value = this.data.value;

        if(value.length >= this.data.startLength) {
            this.toggle(true);
            if(this.service)
                this.$updateSource();
        } else
            this.toggle(false, true);
    },
    /**
     * @private
     */
    _onBlur: function($event) {

    },
    /**
     * @private
     */
    getParams: function() {
        return {value: this.data.value};
    },
    /**
     * @private
     */
    filter: function(item) {
        var value = this.data.value;

        if(!value && this.data.startLength)
            return false;

        if(this.data.matchType === 'all')
            return item.name.indexOf(value) >= 0;
        else if(this.data.matchType === 'startLength')
            return item.name.slice(0, value.length) === value;
        else if(this.data.matchType === 'end')
            return item.name.slice(-value.length) === value;
    }
});

module.exports = Suggest;
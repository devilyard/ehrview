$package("util.widgets")

util.widgets.IconCombo = function(config) {
	util.widgets.IconCombo.superclass.constructor.call(this, config);
	this.tpl = config.tpl ||
	'<tpl for=".">'
	+ '<div class="x-combo-list-item">'
	+ '<table><tbody><tr>'
	+ '<td>'
	+ '<div class="{' + this.iconClsField + '} x-icon-combo-icon"></div></td>'
	+ '<td class=>{' + this.displayField + '}</td>'
	+ '</tr></tbody></table>'
	+ '</div></tpl>';
	this.on({
		render : {
			scope : this,
			fn : function() {
       			 var wrap = this.el.up('div.x-form-field-wrap');
       			 this.wrap.applyStyles({position:'relative'});
        		 this.el.addClass('x-icon-combo-input');
        		 this.flag = Ext.DomHelper.append(wrap, {
            			tag: 'div', style:'position:absolute'
        		 });
			}
		}
	});
}

Ext.extend(util.widgets.IconCombo, Ext.form.ComboBox, {
	setIconCls : function() {
		var rec = this.store.query(this.valueField, this.getValue()).itemAt(0);
		if (rec) {
			this.flag.className = 'x-icon-combo-icon '
					+ rec.get(this.iconClsField);
		}
	},

	setValue : function(value) {
		util.widgets.IconCombo.superclass.setValue.call(this, value);
		this.setIconCls();
	}
});
$package( "app.biz.ehrview" )

$import( "app.modules.list.SimpleListView" )

app.biz.ehrview.LabExamSet = function ( cfg ) {
	cfg.createCls = "app.biz.ehrview.LabExamSetFormView"
	cfg.updateCls = "app.biz.ehrview.LabExamSetFormView"
	app.biz.ehrview.LabExamSet.superclass.constructor.apply( this, [ cfg ] )
//	this.autoLoadData = true
//	this.disablePagingTbr = false
}

Ext.extend(app.biz.ehrview.LabExamSet, app.modules.list.SimpleListView, {
} )
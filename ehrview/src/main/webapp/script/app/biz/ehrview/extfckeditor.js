$package( "app.biz.ehrview" )

$import( "app.biz.fckeditor.fckeditor" )

Ext.form.FCKeditor = function(config){
	Ext.form.FCKeditor.superclass.constructor.call(this, config);
	this.FCKid=0;
	this.MyisLoaded=false;
	this.MyValue='';
};

Ext.extend(Ext.form.FCKeditor, Ext.form.TextArea,  {
	onRender : function(ct, position){
        if(!this.el){
            this.defaultAutoCreate = {
                tag: "textarea",
                style:"width:100px;height:60px;",
                autocomplete: "off"
            };
        }
        Ext.form.TextArea.superclass.onRender.call(this, ct, position);
        if(this.grow){
            this.textSizeEl = Ext.DomHelper.append(document.body, {
                tag: "pre", cls: "x-form-grow-sizer"
            });
            if(this.preventScrollbars){
                this.el.setStyle("overflow", "hidden");
            }
            this.el.setHeight(this.growMin);
        }
		if (this.FCKid==0) this.FCKid=get_FCKeditor_id_value()
		setTimeout("loadFCKeditor('"+this.name+"');",100);
    },
    setValue : function(value){
    	this.MyValue=value;
    	if (this.FCKid==0) this.FCKid=get_FCKeditor_id_value()
    	FCKeditorSetValue(this.FCKid,this.name,value)
    	Ext.form.TextArea.superclass.setValue.apply(this,[value]);
    },
    
   
    
    getValue : function(){
    	if (this.MyisLoaded){
    		value=FCKeditorGetValue(this.name);
    		Ext.form.TextArea.superclass.setValue.apply(this,[value]);
			return Ext.form.TextArea.superclass.getValue(this);
    	}else{
    		return this.MyValue;
    	}
    },
    
    getRawValue : function(){
    	if (this.MyisLoaded){
    		value=FCKeditorGetValue(this.name);
    		Ext.form.TextArea.superclass.setRawValue.apply(this,[value]);
			return Ext.form.TextArea.superclass.getRawValue(this);
    	}else{
    		return this.MyValue;
    	}
    }
});
Ext.reg('fckeditor', Ext.form.FCKeditor);


function loadFCKeditor(element){
	var sFCKeditorToolbar = 'Default';
	var sFCKeditorBasePath = '/ehrview/script/app/biz/fckeditor/';
//	var sFCKeditorBaseHref = 'http://localhost/test/';
	var sFCKeditorSkinPath = '/ehrview/script/app/biz/fckeditor/editor/skins/office2003/';
	oFCKeditor = new FCKeditor( element ) ;
	oFCKeditor.ToolbarSet = sFCKeditorToolbar ;
//	oFCKeditor.Config['SkinPath'] = sFCKeditorSkinPath ;
//	oFCKeditor.Config['PreloadImages'] = sFCKeditorSkinPath + 'images/toolbar.start.gif' + ';' +
//				sFCKeditorSkinPath + 'images/toolbar.end.gif' + ';' +
//				sFCKeditorSkinPath + 'images/toolbar.bg.gif' + ';' +
//				sFCKeditorSkinPath + 'images/toolbar.buttonarrow.gif' ;
	oFCKeditor.BasePath	= sFCKeditorBasePath ;
//	oFCKeditor.Config['BaseHref']	= sFCKeditorBaseHref ;
	oFCKeditor.Height = 420 ;
	oFCKeditor.ReplaceTextarea() ;

}
function FCKeditor_OnComplete(editorInstance){

    Ext.getCmp(editorInstance.Name).MyisLoaded=true;

    editorInstance.Events.AttachEvent('OnStatusChange', function(){
    	Ext.getCmp(editorInstance.Name).setValue();
    })
}
var FCKeditor_value=new Array();
function FCKeditorSetValue(id,name,value){
	if ((id!=undefined)&&(name!=undefined)){
		if (value!=undefined) FCKeditor_value[id]=value;
		else if (FCKeditor_value[id]==undefined) FCKeditor_value[id]='';
		var oEditor = FCKeditorAPI.GetInstance(name) ;
		
		if(oEditor!=undefined) oEditor.SetData(FCKeditor_value[id])
	}
}
function FCKeditorGetValue(name){
	if ((id!=undefined)&&(name!=undefined)){
		var oEditor = FCKeditorAPI.GetInstance(name) ;
		data='';
		if(oEditor!=undefined) data=oEditor.GetData()
		return data;
	}
}
var FCKeditor_id_value;
function get_FCKeditor_id_value(){
	if (!FCKeditor_id_value){
		FCKeditor_id_value=0;
	}
	FCKeditor_id_value=FCKeditor_id_value+1;
	return FCKeditor_id_value;
}

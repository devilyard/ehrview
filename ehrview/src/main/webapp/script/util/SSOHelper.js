$package("util")

util.SSOHelper = function(cfg){            
      var form = {
          tag:'form',
          name:'ssoForm',
          method:'post',
          action:cfg.url,
          style:'display:none',
          children:[
             {tag:'input',type:'hidden',name:'uid',value:cfg.uid},
             {tag:'input',type:'hidden',name:'psw',value:cfg.psw},
             {tag:'input',type:'hidden',name:'urole',value:cfg.urole}
          ]
      }
      //var html = Ext.DomHelper.markup(form)
      Ext.DomHelper.append(document.body,form)
      document.ssoForm.submit()
}
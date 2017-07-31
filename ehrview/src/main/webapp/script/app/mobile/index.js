Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
        // Create a Carousel of Items
        var carousel = new Ext.Carousel({
        	fullscreen:true,
            items: [{
            	layout:'vbox',
            	align:'left',
            	items:[ {
                    xtype: 'fieldset',
                    title: 'Personal Info',
                    instructions: 'Please enter the information above.',
                    defaults: {
                        required: true,
                        labelAlign: 'left'
                    },
                    items: [{
                    	
                        xtype: 'textfield',
                        name : 'name',
                        label: 'Name'
                    }, {
                        xtype: 'passwordfield',
                        name : 'password',
                        label: 'Password'
                    }, {
                        xtype: 'textfield',
                        name : 'disabled',
                        label: 'Disabled',
                        disabled: true
                    }, {
                        xtype: 'emailfield',
                        name : 'email',
                        label: 'Email',
                        placeholder: 'you@domain.com'
                    }, {
                        xtype: 'urlfield',
                        name : 'url',
                        label: 'Url',
                        placeholder: 'http://google.com'
                    }, {
                        xtype: 'checkbox',
                        name : 'cool',
                        label: 'Cool'
                    }, {
                        xtype: 'spinnerfield',
                        name : 'spinner',
                        label: 'Spinner'
                    }, {
                        xtype: 'select',
                        name : 'rank',
                        label: 'Rank',
                        options: [
                            {text: 'Master',  value: 'master'},
                            {text: 'Student', value: 'padawan'}
                        ]
                    }, {
                        xtype: 'hidden',
                        name : 'secret',
                        value: false
                    }, {
                        xtype : 'textarea',
                        name  : 'bio',
                        label : 'Bio'
                    }, {
                        xtype: 'slider',
                        name : 'height',
                        label: 'Height'
                    }, {
                        xtype: 'toggle',
                        name : 'enable',
                        label: 'Security Mode'
                    }, {
                        xtype: 'radio',
                        name: 'color',
                        label: 'Red'
                    }, {
                        xtype: 'radio',
                        name: 'color',
                        label: 'Blue'
                    }]
                }]	
            	
           },{
            	
            	items:[{
            		layout:'vbox',
            		xtype:'fieldset',
            		items:[{
                        xtype: 'textfield',
                        name : 'name',
                        label: 'age'
                    }, {
                        xtype: 'passwordfield',
                        name : 'password',
                        label: 'Password'
                	}]
            	}]	
           }]
        });
       var form = new Ext.form.FormPanel({
        	fullscreen:true,
        	items:carousel
        })
        form.show()
    }
});
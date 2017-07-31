$import("org.ext.ext-base", "org.ext.ext-all", "org.ext.ext-patch",
		"org.ext.ext-lang-zh_CN", "app.desktop.Module",
		"app.desktop.TaskManager", "app.desktop.Desktop", "app.desktop.App",
		"util.rmi.miniJsonRequestSync");
		
$styleSheet("ext.ext-all");
$styleSheet("app.desktop.Desktop")
$styleSheet("ext.xtheme-gray")
$styleSheet("ext.ext-patch");		


//Ext.BLANK_IMAGE_URL = ClassLoader.appRootOffsetPath + "inc/resources/s.gif";

__docRdy = false;
Ext.onReady(function() {
			if (__docRdy) {
				return;
			}
			__docRdy = true;
			var argStr = window.location.search.substring(1);
			// argStr = base64decode(argStr);
			var args = argStr.split('&');
			var cfg = {};
			for (var i = 0; i < args.length; i++) {
				var arg = args[i];
				var temp = arg.split('=');
				var s = temp[1].charAt(0);
				var end = temp[1].charAt(temp[1].length);
				if (s != "[" && s != "{" && end != "]" && end != "}") {
					cfg[temp[0]] = temp[1];
				} else {
					cfg[temp[0]] = eval(temp[1]);
				}
			}
			var result = util.rmi.miniJsonRequestSync({
						serviceId : "logon",
						forConfig : true,
						deep : false,
						uid : cfg["uid"],
						psw : cfg["pass"],
						rid : cfg["role"],
						replace : cfg["replace"]
					});

			if (result.code != 200) {
				Ext.Msg.alert("����", "��¼ʧ�ܣ�" + result.msg);
				return;
			}
			var ref = cfg.ref;
			if (ref) {
				var mcl = util.rmi.miniJsonRequestSync({
							serviceId : "moduleConfigLocator",
							id : ref
						});
				if (mcl.code == 200) {
					Ext.apply(cfg, mcl.json.body);
				}
			}

			var mainCfg = {
				title : result.json.title,
				uid : result.json.userId,
				uname : result.json.userName,
				dept : result.json.dept,
				deptId : result.json.deptId,
				jobtitle : result.json.jobtitle,
				topManage : result.topManage,
				serverDate : result.json.serverDate,
				apps : [],
				modules : []
			};
			this.mainApp = new app.desktop.App(mainCfg);
			cfg["mainApp"] = this.mainApp;
			var cls = cfg["script"];

			var pageWidth = document.documentElement.clientWidth;
			var pageHeight = document.documentElement.clientHeight;

			$require(cls, [function() {
						var module = eval("new " + cls + "(cfg)");
						var viewport = new Ext.Viewport({
									layout : 'fit',
									hideBorders : true,
									items : [module.initPanel()]
								});
							// var size = m.getWin().getSize();
							// var x = (pageWidth - size.width) / 2;
							// var y = (pageHeight - size.height) / 2;
							// m.getWin().setPosition(x, y);
							// var win = m.getIWin();
							// win.setSize(pageWidth, pageHeight);
							// win.show();
						}, this]);
		});
var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1,
		63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
		20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31,
		32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
		50, 51, -1, -1, -1, -1, -1);

// Base64����
function base64decode(str) {
	var c1, c2, c3, c4;
	var i, len, out;

	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		/* c1 */
		do {
			c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		} while (i < len && c1 == -1);
		if (c1 == -1) {
			break;
		}
		/* c2 */
		do {
			c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		} while (i < len && c2 == -1);
		if (c2 == -1) {
			break;
		}
		out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

		/* c3 */
		do {
			c3 = str.charCodeAt(i++) & 0xff;
			if (c3 == 61) {
				return out;
			}
			c3 = base64DecodeChars[c3];
		} while (i < len && c3 == -1);
		if (c3 == -1) {
			break;
		}
		out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

		/* c4 */
		do {
			c4 = str.charCodeAt(i++) & 0xff;
			if (c4 == 61) {
				return out;
			}
			c4 = base64DecodeChars[c4];
		} while (i < len && c4 == -1);
		if (c4 == -1) {
			break;
		}
		out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
	}
	return out;
}
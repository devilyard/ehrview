$package("util")

Ext.apply(Ext.form.VTypes, {
			"idCard" : function(pId) {
				var arrVerifyCode = [1, 0, "x", 9, 8, 7, 6, 5, 4, 3, 2];
				var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
				var Checker = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
				if (pId.length != 15 && pId.length != 18) {
					this.idCardText = "身份证号共有 15 码或18位"
					return false;
				}

				var Ai = pId.length == 18 ? pId.substring(0, 17) : pId.slice(0,
						6)
						+ "19" + pId.slice(6, 16);
				if (!/^\d+$/.test(Ai)) {
					this.idCardText = "身份证除最后一位外，必须为数字！"
					return false
				}
				var yyyy = Ai.slice(6, 10), mm = Ai.slice(10, 12) - 1, dd = Ai
						.slice(12, 14);
				var d = new Date(yyyy, mm, dd), year = d.getFullYear(), mon = d
						.getMonth(), day = d.getDate(), now = new Date();
				if (year != yyyy || mon != mm || day != dd || d > now
						|| now.getFullYear() - year > 110
						|| !function(dd, mm, yyyy) {
							if (mm == 2) {
								var leap = (yyyy % 4 == 0 && (yyyy % 100 != 0 || yyyy
										% 400 == 0));
								if (dd > 29 || (dd == 29 && !leap)) {
									return false;
								}
							}
							return true;
						}) {
					this.idCardText = "身份证输入错误！"
					return false;
				}
				for (var i = 0, ret = 0; i < 17; i++)
					ret += Ai.charAt(i) * Wi[i];
				Ai += arrVerifyCode[ret %= 11];
				if (pId.length == 18 && pId.toLowerCase() != Ai) {
					this.idCardText = "身份证输入错误！"
					return false
				} else {
					return true
				}
			},
			"idCardText" : this.idCardText,
			"idCardMask" : /[0-9xX]/i
		})

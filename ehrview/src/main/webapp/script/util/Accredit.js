$package("util")

util.Accredit = {
	canRead:function(ac){
		return this.check(ac,3)
	},
	canCreate:function(ac){
		return this.check(ac,2)
	},
	canUpdate:function(ac){
		return this.check(ac,1)
	},
	canRemove:function(ac){
		return this.check(ac,0)
	},
	check:function(ac,index){
		if(ac && ac.length == 4){
			return ac.charAt(index) == 1
		}
		return false
	}
}
package com.bsoft.ehr.util;

import ctd.dictionary.Dictionaries;
import ctd.dictionary.Dictionary;
import ctd.spring.AppDomainContext;
import ctd.util.AppContextHolder;

public class DictionariesUtil {

	public static Dictionary getDic(String dic){
		
		if(AppContextHolder.isDevMode()){
			return Dictionaries.instance().getDic(dic);
		}else{
			return Dictionaries.instance().getDic(AppDomainContext.getName()+"."+dic);
		}
	}
	
}

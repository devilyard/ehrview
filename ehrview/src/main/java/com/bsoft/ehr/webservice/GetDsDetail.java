package com.bsoft.ehr.webservice;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class GetDsDetail {
	
	public String getDsDetail3301(String param){
		
		StringBuilder sb = new StringBuilder();
		try {
			String docspath=this.getClass().getClassLoader().getResource("").getPath();
			File file = null;
			// str会得到这个函数所在类的路径
			String str = docspath.substring(1, docspath.length());
			// 将%20换成空格（如果文件夹的名称带有空格的话，会在取得的字符串上变成%20）
			str = str.replaceAll("%20", " ");
			// 查找“WEB-INF”在该字符串的位置
			int num = str.indexOf("WEB-INF");
			// 截取即可
			str = str.substring(0, num + "WEB-INF".length() + 1);
			//模板文件
			file = new File(str+"/test.html");
		
			InputStream is = new FileInputStream(file);
			BufferedReader reader = new BufferedReader(new InputStreamReader(is,"utf-8"));   
		       
		    String line = null;   

		     try {   

		            while ((line = reader.readLine()) != null) {   

		            	  sb.append(line);      

		            }   

		        } catch (IOException e) {   

		            e.printStackTrace();   

		        } finally {   

		            try {   

		                is.close();   

		            } catch (IOException e) {   

		                e.printStackTrace();   

		            }   

		        }   

//		     s = new String(sb.toString().getBytes("iso-8859-1"),"utf-8") ;

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return  sb.toString();
	}

}

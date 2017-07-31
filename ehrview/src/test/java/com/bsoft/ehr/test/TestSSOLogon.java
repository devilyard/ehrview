/*
 * @(#)TestSSOLogon.java Created on 2014年1月3日 下午5:11:44
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.commons.httpclient.methods.StringRequestEntity;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class TestSSOLogon {

	/**
	 * @param args
	 * @throws IOException 
	 */
	public static void main(String[] args) throws IOException {
		URL url = new URL("http://127.0.0.1:8080/ehrview/api/logon?user=system&password=123&roleId=ehr.system");
		URLConnection conn = url.openConnection();
		InputStream in = conn.getInputStream();
		BufferedReader reader = new BufferedReader(new InputStreamReader(in));
		String line = reader.readLine();
		System.out.println(line);
		
		HttpClient client = new HttpClient();
		PostMethod method = new PostMethod("http://127.0.0.1:8080/ehrview/api/logon");
		RequestEntity entity = new StringRequestEntity("{\"user\":\"system\",\"password\":\"123\",\"roleId\":\"ehr.system\"}", "application/json", "UTF-8");
		method.setRequestEntity(entity);
		client.executeMethod(method);
		System.out.println(method.getResponseBodyAsString());
	}

}

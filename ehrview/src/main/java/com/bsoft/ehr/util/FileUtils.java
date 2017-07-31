package com.bsoft.ehr.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class FileUtils {

	public static final int BUFFEREDSIZE = 1028;
	public static final String CODE_GBK = "GBK";
	public static final String CODE_UTF8 = "UTF-8";

	private static final Log logger = LogFactory.getLog(FileUtils.class);

	public static String readFileByLines(String fileName) {
		File file = new File(fileName);
		StringBuffer sb = new StringBuffer();
		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), CODE_UTF8));
			String tempString = null;
			while ((tempString = reader.readLine()) != null) {
				sb.append(tempString);
				sb.append("\r\n");
			}
			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (reader != null) {
				try {
					reader.close();
				} catch (IOException e1) {
				}
			}
		}
		return sb.toString();
	}

	public static void writerFile(String path, String data,boolean reWriter) {

		FileWriter fileWritter;
		try {
//			fileWritter = new FileWriter(path, reWriter);
			OutputStreamWriter write = new  OutputStreamWriter(new FileOutputStream(path,reWriter),"UTF-8");
//			BufferedWriter bufferWritter = new BufferedWriter(fileWritter);
			BufferedWriter bufferWritter = new BufferedWriter(write);
			bufferWritter.write(data);
			bufferWritter.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}

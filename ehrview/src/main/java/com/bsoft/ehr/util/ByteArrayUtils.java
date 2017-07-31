/*
 * @(#)ByteArrayUtils.java Created on 2013年12月11日 上午10:32:25
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.util;

import info.monitorenter.cpdetector.io.CodepageDetectorProxy;
import info.monitorenter.cpdetector.io.JChardetFacade;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.Charset;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ByteArrayUtils {

	/**
	 * @param bytes
	 * @return
	 */
	public static String guessEncoding_bak(byte[] bytes) {
		CodepageDetectorProxy detector = CodepageDetectorProxy.getInstance();
		detector.add(JChardetFacade.getInstance());
		ByteArrayInputStream bi = new ByteArrayInputStream(bytes, 0,
				bytes.length);
		String encoding = null;
		try {
			Charset charset = detector.detectCodepage(bi, bytes.length);
			if (charset != null && !charset.displayName().equals("void")) {
				encoding = charset.displayName();
			}
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				bi.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		return encoding == null ? "UTF-8" : encoding;
	}
	
	/**
	 * @param bytes
	 * @return
	 */
	 public static String guessEncoding(byte[] data) {
	        int utfCount = 0;
	        boolean isUtf8 = true;
	        for (int i = 0; i < data.length; i++) {
	            byte b0 = data[i];
	            if (utfCount == 0) {
	                if ((b0 & 0x80) != 0) {
	                    if ((b0 & 0xE0) == 0xC0) {
	                        utfCount = 1;
	                    } else if ((b0 & 0xF0) == 0xE0) {
	                        utfCount = 2;
	                    } else if ((b0 & 0xF8) == 0xF0) {
	                        utfCount = 3;
	                    } else if ((b0 & 0xFC) == 0xF8) {
	                        utfCount = 4;
	                    } else if ((b0 & 0xFE) == 0) {
	                        utfCount = 5;
	                    } else {
	                        isUtf8 = false;
	                        break;
	                    }
	                }
	            } else {
	                if ((b0 & 0xC0) != 0x80) {
	                    isUtf8 = false;
	                    break;
	                }
	                --utfCount;
	            }
	        }

	        if (isUtf8) {
	            return "UTF-8";
	        } else {
	            return "GBK";
	        }
	    }
}

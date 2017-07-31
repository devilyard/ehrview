package com.bsoft.ehr.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.dom4j.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.bsoft.ehr.auth.HttpSessionHolder;
import com.bsoft.ehr.auth.VisitKey;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import ctd.service.core.Service;

public class HttpHelper {

	private static final Logger logger = LoggerFactory
			.getLogger(HttpHelper.class);

	public static final String SESSIONID_KEY_NAME = "sessionId";

	public final static int SUCCESS_CODE = 200;
	public final static String SUCCESS_MSG = "success";
	private static ObjectMapper jsonMapper = new ObjectMapper();

	static {
		jsonMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
				false);
		jsonMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
	}

	public static void writeXML(Document doc, HttpServletResponse res) {
		writeXML(doc.asXML(), res);
	}

	public static void writeXML(String xml, HttpServletResponse res) {
		res.setContentType("text/xml;charset=UTF-8");
		try {
			res.getWriter().print(xml);
		} catch (IOException e) {
			logger.error("Failed to write xml response data.", e);
		}
	}

	public static void writeHtml(String html, HttpServletResponse res) {
		res.setContentType("text/html;charset=UTF-8");
		try {
			res.getWriter().print(html);
		} catch (IOException e) {
			logger.error("Failed to write html response data.", e);
		}
	}

	public static void writeJSON(Object body, HttpServletResponse res) {
		writeJSON(SUCCESS_CODE, SUCCESS_MSG, body, res);
	}

	public static void writeJSON(int code, String msg, Object body,
			HttpServletResponse res) {
		HashMap<String, Object> map = new HashMap<String, Object>();
		map.put(Service.RES_CODE, code);
		map.put(Service.RES_MESSAGE, msg);
		map.put("body", body);
		res.setContentType("text/javascript");
		OutputStreamWriter out;
		try {
			out = new OutputStreamWriter(res.getOutputStream(), "UTF-8");
			jsonMapper.writeValue(out, map);
		} catch (Exception e) {
			logger.error("Failed to write json response data.", e);
		}
	}

	@SuppressWarnings("unchecked")
	public static HashMap<String, Object> parseRequest(
			HttpServletRequest request) {
		try {
			String encoding = request.getCharacterEncoding();
			if (encoding == null) {
				encoding = "UTF-8";
			}
			InputStream ins = request.getInputStream();
			return jsonMapper.readValue(ins, HashMap.class);
		} catch (Exception e) {
			logger.error("parseRequest failed:", e);
		}
		return new HashMap<String, Object>();
	}

	/**
	 * @param args
	 * @param uuid
	 * @return
	 */
	public static String getSessionId(HttpServletRequest request, VisitKey visitKey) {
		String sessionId = (String) request
				.getAttribute(HttpHelper.SESSIONID_KEY_NAME);
		if (sessionId != null) {
			return sessionId;
		}
		if (visitKey != null && visitKey.getSessionId() != null) {
			return visitKey.getSessionId();
		}
		return request.getSession().getId();
	}

	/**
	 * @param request
	 * @param uuid
	 * @return
	 */
	public static HttpSession getSession(HttpServletRequest request, VisitKey visitKey) {
		return HttpSessionHolder.get(getSessionId(request, visitKey));
	}
	
	
	public HttpSession getSession(){
		HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();  
		return request.getSession();
	}
}

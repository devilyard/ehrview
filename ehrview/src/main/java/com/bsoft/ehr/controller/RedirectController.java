package com.bsoft.ehr.controller;


import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.bsoft.ehr.auth.HttpSessionHolder;
import com.bsoft.ehr.service.BrowsingHistorySaveService;
import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;

import ctd.accredit.User;
import ctd.accredit.UsersController;
import ctd.service.core.Service;
import ctd.util.MD5StringUtil;
import ctd.util.MapperUtil;
import ctd.util.collect.OnlineUserInfo;
import org.apache.xerces.impl.dv.util.Base64;

@Controller
public class RedirectController {

	private static final Logger logger = LoggerFactory
			.getLogger(RedirectController.class);

	@Autowired
	private IMPIProvider mpiProvider; 
	@Resource
	private BrowsingHistorySaveService browsingHistorySaveService;
	
	@RequestMapping(value = "/redirect", method = RequestMethod.GET)
	public String redirect(HttpServletRequest request, HttpServletResponse response) {
		Map<String, Object> res = new HashMap<String, Object>();
		
		try{
			String uid = new String(Base64.decode(request.getParameter("user")));
			String pwd = new String(Base64.decode(request.getParameter("password")));
			String idCard = new String(Base64.decode(request.getParameter("idCard")));
			if (StringUtils.isEmpty(uid) || StringUtils.isEmpty(pwd)) {
				res.put(Service.RES_CODE, 405);
				res.put(Service.RES_MESSAGE, "username or password emtry");
				writeToResponse(response, res);
				return "";
			}
			User user = UsersController.instance().getUser(uid);
			if (user == null) {
				res.put(Service.RES_CODE, 406);
				res.put(Service.RES_MESSAGE, "user not found");
				writeToResponse(response, res);
				return "";
			}
			if (!user.validatePassword(MD5StringUtil.MD5Encode(pwd))) {
				res.put(Service.RES_CODE, 406);
				res.put(Service.RES_MESSAGE, "username and password mismatch");
				writeToResponse(response, res);
				return "";
			}
			
			HttpSession session = request.getSession();	// create session now
			session.setAttribute(OnlineUserInfo.CLIENT_IP, request.getRemoteAddr());
			session.setAttribute("uid", uid);
			HttpSessionHolder.add(session);
			Map<String, Object> mpi = new HashMap<String ,Object>();
			mpi.put("idCard", idCard);
			List<Map<String, Object>> list = null;
			try {
				list = mpiProvider.getMPI(mpi);
			} catch (MPIServiceException e2) {
				e2.printStackTrace();
			}
			
			String code = "UTF-8";
			// 解决中文乱码问题
			if (request.getHeader("User-Agent").toUpperCase()
					.indexOf("MSIE") > 0) {
					code = "GBK";
			}
			if(list != null && !list.isEmpty()){
				mpi.putAll(MPIProxy.handle(list.get(0)));
				try {
					mpi.put("organizationcode",request.getParameter("organizationcode") == null ? "" : new String(Base64.decode(request.getParameter("organizationcode"))));
					mpi.put("docid", request.getParameter("docid") == null ? "" : new String(Base64.decode(request.getParameter("docid"))));
					mpi.put("docidcard", request.getParameter("docidcard") == null ? "" : new String(request.getParameter("docidcard").getBytes("ISO-8859-1"), code));
					mpi.put("docname", request.getParameter("docname") == null ? "" : new String(request.getParameter("docname").getBytes("ISO-8859-1"), code));
					mpi.put("datasource", request.getParameter("datasource") == null ? "" : new String(request.getParameter("datasource").getBytes("ISO-8859-1"), code));
				} catch (UnsupportedEncodingException e) {
					logger.error("Decode is error", e);
					e.printStackTrace();
				}
				
				browsingHistorySaveService.saveBrowsingHistoryOther(mpi, user);
			}else{
				return  "redirect:close.html";
			}
			String vk = session.getId() + "-" + mpi.get("mpiId");
			
			return "redirect:pages/viewPortal.html?vk="+vk;
			
		}catch(Exception e){
			return "redirect:close.html?code=201";
		}
	}
	
	private void writeToResponse(HttpServletResponse response, Object obj) {
		response.setCharacterEncoding("utf-8");
		response.addHeader("content-type", "json/application");
		try {
			OutputStreamWriter out = new OutputStreamWriter(
					response.getOutputStream(), "UTF-8");
			MapperUtil.write(out, obj);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}

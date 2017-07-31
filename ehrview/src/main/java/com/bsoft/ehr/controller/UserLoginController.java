package com.bsoft.ehr.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.support.dao.DefaultDAOProxy;

import ctd.util.MD5StringUtil;

@Controller
public class UserLoginController{

	private static final Logger logger = LoggerFactory
			.getLogger(UserLoginController.class);

	@Autowired
	private DefaultDAOProxy dao;
	
	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/query/UserLogin", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse queryUser(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> records = dao.queryForList("from EHR_UserPrivacy where mpiId=?", new Object[] { visitKey.getMpiId()});
			if(records.isEmpty() || records == null){
				res.setCode(ServiceCode.CODE_NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error("Cannot query User.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "查询userlogin用户失败。");
		}
		return res;
	}
	
	
	@RequestMapping(value = "/login/UserLogin", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse loginUser(VisitKey visitKey,@RequestParam String password) {
		ControllerResponse res = new ControllerResponse();
		try {
//			password = MD5StringUtil.MD5Encode(password);
			List<Map<String, Object>> records = dao.queryForList("from EHR_UserPrivacy where mpiId=? and passWord=?", new Object[] { visitKey.getMpiId(),password});
			if(records.isEmpty() || records == null){
				res.setCode(ServiceCode.CODE_NOT_FOUND);
			}
		} catch (Exception e) {
			logger.error("Cannot login User.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "userlogin登陆失败。");
		}
		return res;
	}
	
}

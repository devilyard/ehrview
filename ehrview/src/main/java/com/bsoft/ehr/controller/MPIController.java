/*
 * @(#)MPIController.java Created on 2013年11月8日 上午11:29:16
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.service.BrowsingHistorySaveService;
import com.bsoft.ehr.util.MPIProxy;
import com.bsoft.ehr.web.method.support.LogonSession;
import com.bsoft.ehr.web.type.Image;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.healthRecord.HealthRecordDocumentEntryRetrieveService;

/**
 * 个人信息。
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
@Controller
@LogonValidation
public class MPIController {

	private static final Logger logger = LoggerFactory
			.getLogger(MPIController.class);

	@Autowired
	private IMPIProvider mpiProvider;
	@Resource
	private HealthRecordDocumentEntryRetrieveService healthRecordService;
	@Resource
	private BrowsingHistorySaveService browsingHistorySaveService;

	/**
	 * 获取个人基本信息。
	 * 
	 * @param session
	 * @param visitKey
	 * @return
	 */
	@RequestMapping(value = "/mpi/getBaseInfo", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getMPIBaseInfo(@LogonSession HttpSession session,
			VisitKey visitKey) {
		Map<String, Object> mpi;
		ControllerResponse res = new ControllerResponse();
		try {
			mpi = MPIProxy.getBaseMPI(visitKey.getMpiId());
			if (mpi != null) {
				mpi = MPIProxy.handle(mpi);
				Map<String, Object> manaInfo = healthRecordService
						.getManageInfo(visitKey.getMpiId());
				if (manaInfo != null) {
					mpi.putAll(manaInfo);
				}
				browsingHistorySaveService.saveBrowsingHistory(mpi, session);
				res.setBody(mpi);
			}
		} catch (MPIServiceException e) {
			logger.error("Failed to get mpi base information for: {}",
					visitKey.getMpiId(), e);
			res.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
			res.setMessage("个人信息获取失败：" + e.getMessage());
			return res;
		} catch (DocumentEntryException e) {
			logger.error("Failed to get mpi base information for: {}",
					visitKey.getMpiId(), e);
			res.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
			res.setMessage("个人信息获取失败：" + e.getMessage());
			return res;
		}
		return res;
	}

	/**
	 * 获取头像。
	 * 
	 * @param visitKey
	 * @return
	 */
	@RequestMapping(value = "/mpi/getPhoto", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getPhoto(VisitKey visitKey) {
		ControllerResponse res = new ControllerResponse();
		String photoUrl;
		try {
			photoUrl = mpiProvider.getPhotosUrl(visitKey.getMpiId());
			res.setBody(photoUrl);
		} catch (MPIServiceException e) {
			logger.error("Cannot get photo for: {}", visitKey.getMpiId(), e);
			res.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
			return res;
		}
		return res;
//		InputStream in = null;
//		ByteArrayOutputStream out = null;
//		try {
//			URL url = new URL(photoUrl);
//			URLConnection connection = url.openConnection();
//			in = connection.getInputStream();
//			out = new ByteArrayOutputStream();
//			int l = 0;
//			byte[] b = new byte[10240];
//			while ((l = in.read(b)) > 0) {
//				out.write(b, 0, l);
//			}
//			byte[] photo = out.toByteArray();
//			Image image = new Image();
//			image.setData(photo);
//			String type = connection.getContentType();
//			image.setType(type);
//			return image;
//		} catch (IOException e) {
//			logger.error("Cannot get photo for: {}", visitKey.getMpiId(), e);
//			return null;
//		} finally {
//			try {
//				if (in != null) {
//					in.close();
//				}
//				if (out != null) {
//					out.close();
//				}
//			} catch (IOException e) {
//
//			}
//		}
	}

	/**
	 * mpi检索，获取符合条件的个人基本信息列表，列表以匹配程度从高到低排序。
	 * 
	 * @param args
	 * @return
	 */
	@RequestMapping(value = "/mpi/getMPIList", method = RequestMethod.POST)
	public @ResponseBody
	ControllerResponse getMPIList(@RequestBody Map<String, String> args) {
		ControllerResponse response = new ControllerResponse();
		if (args.isEmpty()) {
			return response;
		}
		String cardNo = args.get("cardNo");
		Map<String, Object> queryArgs = new HashMap<String, Object>();
		if (StringUtils.isNotEmpty(cardNo)) {
			List<Map<String, Object>> cards = new ArrayList<Map<String, Object>>(
					1);
			Map<String, Object> card = new HashMap<String, Object>(2);
			card.put("cardTypeCode", args.get("cardTypeCode"));
			card.put("cardNo", cardNo);
			cards.add(card);
			queryArgs.put("cards", cards);
		}
		String certificateNo = args.get("certificateNo");
		if (StringUtils.isNotEmpty(certificateNo)) {
			List<Map<String, Object>> certificates = new ArrayList<Map<String, Object>>(
					1);
			Map<String, Object> certificate = new HashMap<String, Object>();
			certificate.put("certificateTypeCode",
					args.get("certificateTypeCode"));
			certificate.put("certificateNo", certificateNo);
			certificates.add(certificate);
			queryArgs.put("certificates", certificates);
		}
		String personName = args.get("personName");
		String sexCode = args.get("sexCode");
		String birthday = args.get("birthday");
		if (StringUtils.isNotEmpty(personName)) {
			queryArgs.put("personName", personName);
		}
		if (StringUtils.isNotEmpty(sexCode)) {
			if (!sexCode.equals("0")) {// @@ 如果是选择“不限性别”检索时不添加性别条件。
				queryArgs.put("sexCode", sexCode);
			}
		}
		if (StringUtils.isNotEmpty(birthday)) {
			queryArgs.put("birthday", birthday);
		}
		List<Map<String, Object>> results;
		try {
			results = mpiProvider.getMPINonStrict(queryArgs);
			response.setBody(results);
		} catch (MPIServiceException e) {
			logger.error("Failed to get mpi list: ", e);
			response.setStatus(ServiceCode.SERVICE_PROCESS_FAILED,
					e.getMessage());
		}
		return response;
	}
}

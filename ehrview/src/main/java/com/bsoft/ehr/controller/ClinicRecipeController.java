package com.bsoft.ehr.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.extend.dic.DocumentFormat;
import com.bsoft.mpi.service.ServiceCode;
import com.bsoft.xds.exception.DocumentEntryException;
import com.bsoft.xds.support.instance.opt.OptRecipeDocumentEntryRetrieveService;

/**
 * 门诊处方。
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
@Controller
@LogonValidation
public class ClinicRecipeController extends AbstractTemplateViewController{

	private static final Logger logger = LoggerFactory
			.getLogger(ClinicRecipeController.class);

	@Autowired
	private OptRecipeDocumentEntryRetrieveService optRecipeService;

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/medical/OptRecipe", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getOptRecipe(VisitKey visitKey, Integer start,
			Integer limit) {
		if (start == null) {
			start = 0;
		}
		if (limit == null) {
			limit = 0;
		}
		ControllerResponse res = new ControllerResponse();
		try {
			List<Map<String, Object>> list = optRecipeService
					.findPersonalRecords(visitKey.getMpiId(), start, limit);
			res.setBody(list);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get outpatient recipe record list.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取门诊处方失败。");
		}
		return res;
	}

	/**
	 * @param request
	 * @param vk
	 * @return
	 */
	@RequestMapping(value = "/clinic/getRecipe", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getMedicalRecord(String visitId,
			String authorOrganization, Integer start, Integer limit) {
		ControllerResponse res = new ControllerResponse();
		try {
			if (start == null) {
				start = 0;
			}
			if (limit == null) {
				limit = 20;
			}
			
			List<Map<String, Object>> list = optRecipeService
					.getRecordByVisitId(visitId, authorOrganization, start,
							limit);
			res.setBody(list);
		} catch (DocumentEntryException e) {
			logger.error("Cannot get recipe record.", e);
			res.setStatus(ServiceCode.CODE_DATABASE_ERROR, "获取处方记录失败。");
		}
		return res;
	}
	
	@RequestMapping("/clinic/getHtmlDocument")
	@ResponseBody
	@Override
	public ControllerResponse getHtmlDocument(String dcId) {
		return super.getHtmlDocument(dcId);
	}
	
	@Override
	protected Object getDocument(String dcId) throws DocumentEntryException {
		return optRecipeService.getDocumentByRecordId(dcId,
				DocumentFormat.HTML);
	}
}

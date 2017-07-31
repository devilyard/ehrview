package com.bsoft.ehr.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bsoft.ehr.auth.LogonValidation;
import com.bsoft.ehr.auth.VisitKey;
import com.bsoft.ehr.config.app.App;
import com.bsoft.ehr.config.app.Application;
import com.bsoft.ehr.config.app.ApplicationConfigController;
import com.bsoft.ehr.config.app.Category;
import com.bsoft.ehr.controller.support.ControllerResponse;
import com.bsoft.ehr.controller.support.ServiceCode;
import com.bsoft.ehr.service.LayoutService;
import com.bsoft.ehr.service.PublicHealthInfoService;
import com.bsoft.ehr.util.UserUtil;

import ctd.service.core.ServiceException;
import ctd.util.context.Context;
import ctd.util.exp.ExpException;
import ctd.util.exp.ExpRunner;

/**
 * 页面布局
 * 
 * @author <a href="mailto:lisc@bsoft.com.cn">lisc</a>
 */
@Controller
@LogonValidation
public class LayoutController {

	private static final Logger logger = LoggerFactory
			.getLogger(LayoutController.class);

	@Autowired
	private LayoutService layoutService;
	@Autowired
	private PublicHealthInfoService publicHealthInfoService;

	/**
	 * @param uuid
	 * @param layoutId
	 */
	@RequestMapping(value = "/config/getLayoutApp/{layoutId}")
	@ResponseBody
	public ControllerResponse getLayoutApp(
			@PathVariable("layoutId") String layoutId) {
		ControllerResponse cr = new ControllerResponse();
		try {
			String layoutData = layoutService.getLayoutData(layoutId);
			HashMap<String, Object> res = new HashMap<String, Object>();
			res.put("layoutData", layoutData);
			cr.setBody(res);
		} catch (ServiceException e) {
			logger.error("Failed to get layout data.", e);
			cr.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
			cr.setMessage("无法取得布局信息。");
		}
		return cr;
	}

	/**
	 * @param mpiId
	 * @return
	 * @throws ExpException
	 * @throws ServiceException
	 */
	@RequestMapping(value = "/config/getViewPortalNames", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getViewPortalNames(VisitKey visitKey) {
		ControllerResponse response = new ControllerResponse();
		String roleId = UserUtil.getRoleId();
		String manageUnitId = UserUtil.getManageUnitId();
		Context ctx = new Context();
		ctx.put("roleId", roleId);
		ctx.put("manaUnitId", manageUnitId);
		List<Integer> matched = new ArrayList<Integer>();
		List<Integer> matchedFactors = new ArrayList<Integer>();
		try {
			List<Map<String, Object>> layouts = layoutService.getViewRules();
			for (Map<String, Object> layout : layouts) {
				String pop = (String) layout.get("Population");
				// @@ 条件里如有人群。
				if (StringUtils.isNotEmpty(pop)
						&& ctx.get("populations") == null) {
					List<String> pops = publicHealthInfoService
							.getPopulations(visitKey.getMpiId());
					ctx.put("populations", pops);
				}
				String exp = (String) layout.get("Expression");
				Boolean rest = (Boolean) ExpRunner.run(exp, ctx);
				if (rest && !matched.contains(layout.get("LayoutId"))) {
					int i = 0;
					int expSize = exp.split(",").length;
					for (Integer count : matchedFactors) {
						if (expSize > count) {
							break;
						}
						i++;
					}
					matchedFactors.add(i, expSize);
					matched.add(i, (Integer) layout.get("LayoutId"));
				}
			}
			List<Map<String, Object>> layoutData = layoutService
					.getLayoutNames(matched);
			List<Map<String, Object>> result = new ArrayList<Map<String, Object>>(
					layoutData.size());
			for (Integer layoutId : matched) {
				for (Map<String, Object> l : layoutData) {
					if (l.get("layoutId").equals(layoutId)) {
						result.add(l);
						break;
					}
				}
			}
			
			response.setBody(result);
		} catch (ServiceException e) {
			logger.error(e.getMessage(), e);
			response.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
			response.setMessage("视图生成失败！");
		} catch (ExpException e) {
			logger.error(e.getMessage(), e);
			response.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
			response.setMessage("视图生成失败！");
		}

		return response;
	}

	/**
	 * 获取EHR定义的所有的人群。
	 * 
	 * @param visitKey
	 * @return
	 */
	@RequestMapping(value = "/config/getAllPopulations", method = RequestMethod.GET)
	@ResponseBody
	public ControllerResponse getAllPopulations(VisitKey visitKey) {
		ControllerResponse response = new ControllerResponse();
		response.setBody(publicHealthInfoService.getAllPopulations());
		return response;
	}

	/**
	 * @param uuid
	 * @return
	 */
	@RequestMapping(value = "/config/getAppList")
	@ResponseBody
	public ControllerResponse getAppList() {
		ControllerResponse response = new ControllerResponse();
		Application application;
		application = ApplicationConfigController.instance().getApplication();
		List<Category> list = application.getCategorys();
		List<Object> ll = new ArrayList<Object>();
		for (Category c : list) {
			ll.add(c);
			for (App a : c.getApps()) {
				HashMap<String, String> m = new HashMap<String, String>();
				m.put("pId", a.getCatalogId());
				m.put("name", a.getName());
				m.put("id", a.getId());
				ll.add(m);
			}
		}
		response.setBody(ll);
		return response;
	}

	/**
	 * @param layoutData
	 * @param uuid
	 * @return
	 */
	@RequestMapping(value = "/config/saveApps", method = RequestMethod.POST)
	@ResponseBody
	public ControllerResponse saveApps(@RequestBody Map<String, Object> data) {
		ControllerResponse response = new ControllerResponse();
		try {
			layoutService.saveLayout(data);
		} catch (ServiceException e) {
			logger.error("Failed to save layout data.", e);
			response.setCode(ServiceCode.SERVICE_PROCESS_FAILED);
			response.setMessage("保存布局信息失败：" + e.getMessage());
		}
		return response;
	}

}

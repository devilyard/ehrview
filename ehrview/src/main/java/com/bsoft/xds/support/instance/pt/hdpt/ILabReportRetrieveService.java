package com.bsoft.xds.support.instance.pt.hdpt;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import ctd.annotation.RpcService;

public interface ILabReportRetrieveService  {

	
	/**
	 * 获取检验列表。
	 * @param pageNo
	 * @param pageSize
	 * @param orderField
	 * @param isDesc
	 * @param mpiId
	 * @return
	 */
	@RpcService
	public HashMap<String, Object> getlabList( int pageNo,
			int pageSize, String Classifying,String orderField, boolean isDesc, String mpiId);

	/* (non-Javadoc)
	 * @see com.bsoft.xds.DocumentEntryRetrieveService#getExistFormats(java.lang.String)
	 */
	/**
	 * @param mpiId
	 * @param dcid
	 * @return String
	 */
	@RpcService
	public String getlabHtml(String Classifying,String mpiId,String exp,Object... args);

	/**
	 * 获取模版填充的数据
	 * 
	 * @param data
	 * @param where
	 * @param entnms
	 */
	@RpcService
	public void getData(Map<String, Object> data, String uuid, String[] entnms);
	
	/**
	 * 从数据集中找出对应的展现模板的名称。
	 * 
	 * @param data
	 * @return
	 */
	@RpcService
	public String getTemplateName(Map<String, Object> data);
	
	/**
	 * 修改密码
	 * @param mpiid
	 * @param origpwd
	 * @param pwd
	 * @return
	 */
	@RpcService
	public Map<String, Object> edtpwd(String mpiid,String origpwd,String pwd);
	
	/**
	 * 用户注册
	 * @param UserName
	 * @param cardType
	 * @param IDCard
	 * @param verify
	 * @param RealName
	 * @param PassWord
	 */
	@RpcService
	public Map<String, Object> Register(String UserName, String cardType, String IDCard, String phonenum,String RealName,
			String PassWord,String mpiid );
	
	/**
	 * 密码重置
	 * @param cardType
	 * @param IDCard
	 * @param phonenum
	 * @param mpiid
	 * @return
	 */
	@RpcService
	public Map<String, Object> RestorePwd(String cardType, String IDCard, String phonenum,String mpiid );
	/**
	 * 检查用户
	 * 
	 * @param UserName
	 */
	@RpcService
	public  Map<String, Object> checkUser(String UserName);
	
	/**
	 * 用户登录
	 * 
	 * @param cardId
	 * @param password
	 * @param cardtype
	 * @return
	 */
	@RpcService
	public Map<String, Object> logon( String cardId,String password,String cardtype);
	
	/**
	 * 检查联系方式
	 * 
	 * @param cardType
	 * @param IDCard
	 */
	@RpcService
	public Map<String, Object> getPhonenum( String cardType,String IDCard);

	/**
	 * 获取检验快捷查询列表
	 * 
	 * @param where
	 * @param entnms
	 */
	@RpcService
	public Map<String, Object> getLabSimpleListData(String uuid,
			String[] entnms);
	
	/**
	 * 记录mtc查询日志
	 * @param log
	 */
	@RpcService
	public void saveMtcQueryLog(Map<String, Object> log);
	
	/**
	 * 获取sessionid
	 * 
	 * @param session
	 * 
	 */
	@RpcService
	public String getSession();

	
	/**
	 * 获取血压血糖指标
	 * 
	 * @param mpiid
	 * @return
	 */
	@RpcService
	public HashMap<String, Object> getHisCurve(String mpiid);
}

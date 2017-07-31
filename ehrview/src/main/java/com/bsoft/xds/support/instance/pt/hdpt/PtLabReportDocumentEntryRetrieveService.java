package com.bsoft.xds.support.instance.pt.hdpt;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.dom4j.DocumentException;

import com.bsoft.ehr.auth.HttpSessionHolder;
import com.bsoft.ehr.util.HttpHelper;
import com.bsoft.ehr.util.eval.SimpleDateUtil;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.xds.support.AbstractDocumentEntryRetrieveService;
import com.bsoft.xds.support.instance.CommonDocumentEntryRetrieveService;

import ctd.annotation.RpcService;
import ctd.util.MD5StringUtil;

/**
 * 检验
 *
 */
public class PtLabReportDocumentEntryRetrieveService  extends
CommonDocumentEntryRetrieveService implements
ILabReportRetrieveService {
	

	/* (non-Javadoc)
	 * @see com.bsoft.xds.DocumentEntryRetrieveService#getExistFormats(java.lang.String)
	 */
	/**
	 * 获取检验列表
	 * @param pageNo
	 * @param pageSize
	 * @param orderField
	 * @param isDesc
	 * @param mpiId
	 * @return HashMap
	 */
	@Override
	@RpcService
	public HashMap<String, Object> getlabList( int pageNo,
			int pageSize, String Classifying,String orderField, boolean isDesc, String mpiId){
		HashMap<String, Object> map = new HashMap<String, Object>();
//		map.put(CODE, ServerCode.OK);
//		map.put(MSG, SUCCESS_MSG);
//		try {
//			//只显示市一20130501后的数据
//			String where = HqlComposor.conectWhere(HqlComposor.createWhereQueryByField("MPIID", mpiId),
//									"EffectiveFlag = 0");
//			// String where =
//			// HqlComposor.conectWhere(HqlComposor.createWhereQueryByField("MPIID", mpiId),"EffectiveFlag = 0");
//			 where = HqlComposor.conectWhere(where,"uploadtime >=to_date('20130501','yyyymmdd')");
//			 where = HqlComposor.conectWhere(where,"VersionNumber <>'V2013_SQHIS'");
//			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
//			list =	ehrViewService.find(Classifying, where, pageNo, pageSize, orderField,
//					isDesc);
//			EHRViewService.removeContent(list);
//			map.put(BODY, list);
//			return map;
//		}
//		catch(Exception e){
//			map.put(CODE, ServerCode.SERVICE_PROCESS_FAILED);
//			map.put(MSG, e.getMessage());
//		}
		return map;
	}

	
	/* (non-Javadoc)
	 * @see com.bsoft.xds.DocumentEntryRetrieveService#getExistFormats(java.lang.String)
	 */
	/**
	 * @param Classifying
	 * @param mpiId
	 * @param  exp
	 * @param  args 动态参数 1.姓名 2.是否移动查询
	 * @return String
	 */
	@Override
	@RpcService
	public String getlabHtml(String Classifying,String mpiId,String exp,Object... args){
		Map<String, Object> data = new HashMap<String, Object>();
		String[] entnms = null;
		Boolean   ismobletemplate = false;
//		if (args!= null&&args.length!=0 ){
//			 entnms = new String[args.length+2];
//		}
//		else{
			entnms  = new String[3];
//		}
		
//		entnms[0] =	Classifying;
//		entnms[1] = exp;
//		if (args!= null&&args.length!=0 && ("Cu_Register_SP".equals(entnms[0])||"Pt_LabReport_SP".equals(entnms[0]))){
//			entnms[2] = "[\"or\", [\"eq\", [\"$\", \"a.MPIID\"], [\"s\", \""+mpiId+"\"]], [\"eq\", [\"$\", \"a.NAME\"], [\"s\", \""+args[0]+"\"]]]";
//			if(args.length>=2){
//				ismobletemplate = (Boolean) args[1];
//			}
//		}
//		else{
//			entnms[2] = "[\"and\", [\"eq\", [\"$\", \"1\"], [\"d\", \"1\"]], [\"eq\", [\"$\", \"a.MPIID\"], [\"s\", \""+mpiId+"\"]]]";
//		}
//		//获取xml数据
//		getData(data, mpiId, entnms);
//		//获取blob节点
//		String xml = null;
//		if(data.get("DOCCONTENT")!= null){
//			xml = data.get("DOCCONTENT").toString();
//		}
//		else{
//			return null;
//		}
//		Calendar c = Calendar.getInstance();
//		Map<String, Object> detailInfo;
//		try {
//			if(mpiId == null){
//				detailInfo = new HashMap<String, Object>();
//				detailInfo.put("age","");
//				detailInfo.put("personName",args[0]);
//			}
//			else{
//				//获取详细信息
//				detailInfo = mpiService.getMPI(mpiId);
//				
////				detailInfo.put("hospital", String.valueOf(data.get("AUTHORORGANIZATION_TEXT")));
//				try {
//					c.setTime((Date) detailInfo.get("birthday"));
//					int year = c.get(Calendar.YEAR);
////					int now = c.get(Calendar.YEAR);
//					if(Classifying.equals("Pt_LabReport")){
//						detailInfo.put("age", Integer.valueOf(data.get("JYRQ").toString().substring(0, 4))-year);
//					}
//					else{
//						detailInfo.put("age", Integer.valueOf(data.get("TJRQ").toString().substring(0, 4))-year);
//					}
//				}
//				catch(Exception e){
//					detailInfo.put("age","");
//				}
//			}
//			
//			detailInfo.put("hospital", String.valueOf(data.get("AUTHORORGANIZATION_TEXT")));
//			tvs.setLabReportData(data, detailInfo);
//			//返回html数据
//			if(ismobletemplate){
//				return thymeleaf.getHtml(getTemplateName(data)+"_M", detailInfo, xml.getBytes()).replaceAll("&lt;BR&gt;", "<br>");
//			}
//			else{
//				return thymeleaf.getHtml(getTemplateName(data), detailInfo, xml.getBytes()).replaceAll("&lt;BR&gt;", "<br>");
//			}
//		} catch (MPIServiceException e) {
//			// TODO Auto-generated catch block
//			return  e.getMessage();
//		}
//		catch (DocumentException e) {
//			// TODO Auto-generated catch block
//			return  e.getMessage();
//		}
			return null;

//		HttpHelper.writeHtml(str, response);
	
	}
	

	/**
	 * 获取模版填充的数据
	 * 
	 * @param data
	 * @param where
	 * @param entnms
	 */
	@Override
	@RpcService
	public void getData(Map<String, Object> data, String uuid, String[] entnms) {
//		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
//		String where = "a.EffectiveFlag = 0";
//		int size = entnms.length;
//		for (int i = 1; i < size; i++) {
//			where = HqlComposor.conectWhere(where,
//					HqlComposor.exp2string(entnms[i]));
//		}
//		list = ehrViewService.find(entnms[0], where);
//		if (list.size() > 0) {
//			data.putAll(list.get(0));
//		}
	}
	
	/**
	 * 获取检验快捷查询列表
	 * 
	 * @param data
	 * @param where
	 * @param entnms
	 */
	@Override
	@RpcService
	public Map<String, Object> getLabSimpleListData(String uuid, String[] entnms) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		String where = "a.EffectiveFlag = 0";
		int size = entnms.length;
		Map<String, Object> data =new HashMap<String, Object>();
//		for (int i = 1; i < size; i++) {
//			where = HqlComposor.conectWhere(where,
//					HqlComposor.exp2string(entnms[i]));
//		}
//		list = ehrViewService.find(entnms[0], where);
//		if (list.size() > 0) {
//			data.put("list",list);
//		}
//		else{
//			data.put("list",null);
//		}
//		
		return data;
	}
	
	/**
	 * 从数据集中找出对应的展现模板的名称。
	 * 
	 * @param data
	 * @return
	 */
	@Override
	@RpcService
	public String getTemplateName(Map<String, Object> data) {
		return new StringBuilder().append(data.get("RECORDCLASSIFYING"))
				.append("_").append(data.get("VERSIONNUMBER")).toString();
	}

	/**
	 * 修改密码
	 * @param mpiid
	 * @param origpwd
	 * @param pwd
	 * @return
	 */
	@Override
	@RpcService
	public Map<String, Object> edtpwd(String mpiid,String origpwd,String pwd) {
		List<Object> list = null;
		Map<String, Object> data = new HashMap<String, Object>();
		Map<String, Object> response = new HashMap<String, Object>();
//		System.out.print(MD5StringUtil.MD5Encode(origpwd));
//		list = ehrViewService.find("MTC_MEMBER", "ID",
//				"EMPIID=? and PASSWORD=?   ",mpiid,MD5StringUtil.MD5Encode(origpwd));
//		if(list.size()==1){
//			data.put("PASSWORD", MD5StringUtil.MD5Encode(pwd));
//			ehrViewService.update("MTC_MEMBER","ID="+list.get(0),data);
////			HttpHelper.writeJSON(200, "修改完成！！", null, response);
//			response.put("code", ServerCode.OK);
//			response.put("msg", "修改完成！！");
//			response.put("body", null);
//			return response;
//		}
//		else{
////			HttpHelper.writeJSON(500, "原始密码不正确！！", null, response);
//			response.put("code", 500);
//			response.put("msg", "原始密码不正确！！");
//			response.put("body", null);
			return response;
//		}
	}

	/**
	 * 用户注册
	 * @param UserName
	 * @param cardType
	 * @param IDCard
	 * @param verify
	 * @param RealName
	 * @param PassWord
	 */
	@Override
	@RpcService
	public Map<String, Object> Register(String UserName, String cardType, String IDCard, String phonenum,String RealName,
			String PassWord,String mpiid ){

		List<Object> list = null;
		Map<String, Object> data = new HashMap<String, Object>();
		Map<String, Object> response = new HashMap<String, Object>();
//		//身份证
//		if("1".equals(cardType)){
//				data.put("ID", "0");
//				data.put("USERNAME", UserName);
//				data.put("PASSWORD", MD5StringUtil.MD5Encode(PassWord));
//				data.put("NAME", RealName);
//				data.put("CERTIFICATETYPECODE", "1");
//				data.put("CERTIFICATENO", IDCard);
//				data.put("PHONENUMBER", phonenum);
//				data.put("INPUTDATE",  new Date());
//			} 
//		//市民卡
//		else{
//				data.put("ID", "0");
//				data.put("USERNAME", UserName);
//				data.put("PASSWORD", MD5StringUtil.MD5Encode(PassWord));
//				data.put("NAME", RealName);
//				data.put("CARDTYPE", "2");
//				data.put("CARDNUM", IDCard);
//				data.put("PHONENUMBER", phonenum);
//				data.put("INPUTDATE",  new Date());
//			}
//		if(mpiid!=null){
//			data.put("EMPIID", mpiid);
//			list = ehrViewService.find("MTC_MEMBER", "ID",
//					"EMPIID=?   ",mpiid);
//			if(list.size()>0){
//				data.remove("ID");
//				data.remove("INPUTDATE");
//				data.put("LASTMODIFYDATE",  new Date());
//				ehrViewService.update("MTC_MEMBER","EMPIID='"+mpiid+"'",data);
//			}
//			else{
//				ehrViewService.save("MTC_MEMBER",data);
//			}
//		}
//		//返回正常
////		HttpHelper.writeJSON( 200, "success","注册成功!!",response);
//		response.put("code", ServerCode.OK);
//		response.put("msg", "注册成功!!");
//		response.put("body", null);
		return response;
	}
	
	/**
	 * 密码重置
	 * @param cardType
	 * @param IDCard
	 * @param phonenum
	 * @param mpiid
	 * @return
	 */
	@RpcService
	public Map<String, Object> RestorePwd(String cardType, String IDCard, String phonenum,String mpiid ){

		List<Object> list = null;
		Map<String, Object> data = new HashMap<String, Object>();
		Map<String, Object> response = new HashMap<String, Object>();
//		//身份证
//		if("1".equals(cardType)){
//				data.put("PASSWORD", MD5StringUtil.MD5Encode("000000"));
//				data.put("PHONENUMBER", phonenum);
//			} 
//		//市民卡
//		else{
//				data.put("PASSWORD", MD5StringUtil.MD5Encode("000000"));
//				data.put("PHONENUMBER", phonenum);
//			}
//
//		ehrViewService.update("MTC_MEMBER","EMPIID='"+mpiid+"'",data);
//		
//		//返回正常
////		HttpHelper.writeJSON( 200, "success","注册成功!!",response);
//		response.put("code", ServerCode.OK);
//		response.put("msg", "密码重置为6个0!!");
//		response.put("body", null);
		return response;
	}
	/**
	 * 检查用户
	 * 
	 * @param UserName
	 */
	@Override
	@RpcService
	public  Map<String, Object>  checkUser(String UserName){
		
		List<Object> list = null;
		Map<String, Object> response = new HashMap<String, Object>();
		
//		list = ehrViewService.find("MTC_MEMBER", "EMPIID",
//				"USERNAME=? ", UserName);
//	//返回正常
////	HttpHelper.writeJSON( 200, "success",list.size(),response);
//	response.put("code", ServerCode.OK);
//	response.put("msg", "success");
//	response.put("body", list.size());
	return response;

	}
	
	/**
	 * 用户登录
	 * 
	 * @param cardId
	 * @param password
	 * @param cardtype
	 * @return
	 */
	@Override
	@RpcService
	public Map<String, Object> logon( String cardId,String password,String cardtype){

		List<Object> list = null;
		password = MD5StringUtil.MD5Encode(password);
		Map<String, Object> response = new HashMap<String, Object>();
		
//		//身份证登录
//		if("1".equals(cardtype)){
//			list = ehrViewService.find("MTC_MEMBER", "EMPIID",
//					"CERTIFICATETYPECODE='1'  and PASSWORD=? and CERTIFICATENO=?", password,cardId);
//		}
//		else if("2".equals(cardtype)) {
//			list = ehrViewService.find("MTC_MEMBER", "EMPIID",
//					"CARDTYPE='2'  and PASSWORD=? and CARDNUM=?", password,cardId);
//		}
//		response.put("code", ServerCode.OK);
//		response.put("msg", "success");
//		response.put("body", list);
		return response;
	}
	
	/**
	 * 检查联系方式
	 * 
	 * @param cardType
	 * @param IDCard
	 */
	@Override
	@RpcService
	public  Map<String, Object>getPhonenum( String cardType,String IDCard){
		List<Object> list = null;
		Map<String, Object> response = new HashMap<String, Object>();
//		String mpiid =null;
//		try {
//			//身份证
//		if("1".equals(cardType)){
//				list = ehrViewService.find("MTC_MEMBER", "EMPIID",
//						"CERTIFICATETYPECODE=?  and CERTIFICATENO=? ","1", IDCard);
//				if(list.size()>0){
////					HttpHelper.writeJSON(300, "该证件已经被注册!!", null, response);
//					response.put("code", 300);
//					response.put("msg", "该证件已经被注册!!");
//					response.put("body", null);
//					return response;
//				}
//				mpiid = 	mpiService.getMPIID(IDCard); 
//			} 
//		//市民卡
//		else{
//				list = ehrViewService.find("MTC_MEMBER", "EMPIID",
//					"CARDTYPE=?  and CARDNUM=? ","2", IDCard);
//				if(list.size()>0){
//					response.put("code", 300);
//					response.put("msg", "该证件已经被注册!!");
//					response.put("body", null);
//					return response;
//				}
//				Map<String, Object>   Cardnum =  new HashMap<String, Object>();
//				Map<String, Object>   Cards =  new HashMap<String, Object>();
//				List<Object> Cardslist= new ArrayList<Object>();
//				List<String> result= new ArrayList<String>();
//				Cardnum.put("cardTypeCode", "02");
//				Cardnum.put("cardNo", IDCard);
//				Cardslist.add(Cardnum);
//				
//				Cards.put("cards", Cardslist);
//				result = 	mpiService.getMPIID(Cards);
//				if(result.size()>0){
//					mpiid = result.get(0);
//				}
//				else{
//					mpiid = null;
//				}
//			}
//		response.put("code", ServerCode.OK);
//		response.put("msg", "success");
//		response.put("body", mpiid);
		return response;
//		
//		}
//		catch (MPIServiceException e) {
//			// TODO Auto-generated catch block
////			HttpHelper.writeJSON(500, e.getMessage(), null, response);
//			response.put("code", 500);
//			response.put("msg", e.getMessage());
//			response.put("body", null);
//			return response;
//		}
		
	}
	
	
	/**
	 * 记录mtc查询日志
	 * @param log
	 */
	@Override
	@RpcService
	public void saveMtcQueryLog(Map<String, Object> log) {
//		List<Map<String, Object>> list = null ;
//		try {
//			MongoDBSolrImpl  mtcquerylog = new MongoDBSolrImpl("mtcquerylog");
//			mtcquerylog.add(log);
//			list = mtcquerylog.findAll();
//		} catch (MongoDBException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
//		System.out.println(1123);
		
//		ehrViewService.save("MTC_Query_Log",log);
	}
	
	/**
	 *获取用户sessionid
	 * @param log
	 */
	@RpcService
	public String getSession(){
		//然后再获取session对象
		HttpSession session = new HttpHelper().getSession();
		HttpSessionHolder.add(session);
		System.out.println("添加sessionID===>"+session.getId());
		return session.getId();
	}
	
	/**
	 * 获取血压血糖指标
	 * 
	 * @param mpiid
	 * @return
	 */
	@Override
	@RpcService
	public HashMap<String, Object> getHisCurve(String mpiid) {
		
		HashMap<String, Object> ret = new HashMap<String, Object>();
		Map<String, Object> queryArgs = new HashMap<String, Object>();
		queryArgs.put("mpiId", mpiid);
	    List<Map<String, Object>> bloodlist = getDao().queryForList("SUMMARY_Sym_BloodPressHist", "mpiid=:mpiId order by SYSTEMTIME desc", queryArgs);
	    		
	    int listsize = bloodlist.size();
	    if (listsize > 0) {
	      listsize = listsize > 10 ? 10 : listsize;
	      String[] createdate = new String[listsize];
	      int[] constriction = new int[listsize];
	      int[] diastolic = new int[listsize];
	      int j = 0;
	      for (int i = listsize - 1; i >= 0; i--) {
	    	Map<String, Object> recod = (Map<String, Object>)bloodlist.get(i);
	        createdate[j] = recod.get("SYSTEMTIME") != null ? SimpleDateUtil.format((Date)recod.get("SYSTEMTIME"),"yyyy.MM.dd") : "";
	        constriction[j] = (recod.get("CON") != null ? Integer.parseInt(String.valueOf(recod.get("CON"))) : 0);
	        diastolic[j] = (recod.get("DIA") != null ? Integer.parseInt(String.valueOf(recod.get("DIA"))) : 0);
	        j++;
	      }
	      ret.put("blooddate", createdate);
	      ret.put("constriction", constriction);
	      ret.put("diastolic", diastolic);
	    }

	    List<Map<String, Object>> glucoselist = getDao().queryForList("SUMMARY_Sym_GlucoseHist", "mpiid=:mpiId order by SYSTEMTIME desc", queryArgs);
	    listsize = glucoselist.size();
	    if (listsize > 0) {
	      listsize = listsize > 10 ? 10 : listsize;
	      String[] createdate = new String[listsize];
	      float[] fbs = new float[listsize];
	      float[] pbs = new float[listsize];
	      int j = 0;
	      for (int i = listsize - 1; i >= 0; i--) {
	    	Map<String, Object> recod = (Map<String, Object>)glucoselist.get(i);
	        createdate[j] = recod.get("SYSTEMTIME") != null ? SimpleDateUtil.format((Date)recod.get("SYSTEMTIME"),"yyyy.MM.dd") : "";
	        fbs[j] = recod.get("FBS") != null ? Float.parseFloat(String.valueOf(recod.get("FBS"))) : Integer.valueOf(0);
	        pbs[j] = recod.get("PBS") != null ? Float.parseFloat(String.valueOf(recod.get("PBS"))) : Integer.valueOf(0);
	        j++;
	      }
	      ret.put("glucosedate", createdate);
	      ret.put("fbs", fbs);
	      ret.put("pbs", pbs);
	    }
	    return ret;
	  }
	
	

}

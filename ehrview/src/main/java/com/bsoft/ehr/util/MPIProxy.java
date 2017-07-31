package com.bsoft.ehr.util;

import java.util.Map;

import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;

import com.bsoft.ehr.SysArgs;
import com.bsoft.mpi.server.MPIServiceException;
import com.bsoft.mpi.server.rpc.IMPIProvider;
import com.bsoft.mpi.util.KeyEntityRWLockManager;

import ctd.util.context.Context;
import ctd.util.context.ContextUtils;

public class MPIProxy {

	private static KeyEntityRWLockManager baseInfoLock = new KeyEntityRWLockManager();
	// private static KeyEntityRWLockManager detailInfoLock = new
	// KeyEntityRWLockManager();

	private static IMPIProvider mpiProvider;

	/**
	 * @param request
	 * @return
	 * @throws MPIServiceException
	 */
	@SuppressWarnings("unchecked")
	public static Map<String, Object> getBaseMPI(String mpiId)
			throws MPIServiceException {
		HttpSession session = (HttpSession) ContextUtils.get(Context.WEB_SESSION);
		if (session == null) {
			return mpiProvider.getMPI(mpiId);
		}
		baseInfoLock.tryReadLock(mpiId);
		try {
			Map<String, Object> info = (Map<String, Object>) session
					.getAttribute(SysArgs.MPI_BASE_INFO);
			if (mpiId.equals(session.getAttribute(SysArgs.MPI_BASE_INFO_ID))
					&& info != null) {
				return info;
			}
		} finally {
			baseInfoLock.readUnlock(mpiId);
		}
		try {
			baseInfoLock.writeLock(mpiId);
			Map<String, Object> info = (Map<String, Object>) session
					.getAttribute(SysArgs.MPI_BASE_INFO);
			if (mpiId.equals(session.getAttribute(SysArgs.MPI_BASE_INFO_ID))
					&& info != null) {
				return info;
			}
			Map<String, Object> mpi = mpiProvider.getMPI(mpiId);
			// if (mpi != null && !mpi.isEmpty()) {
			session.setAttribute(SysArgs.MPI_BASE_INFO, mpi);
			try{
				session.setAttribute("PhotosUrl", mpiProvider.getPhotosUrl(mpiId));
			}catch(Exception e){
				e.printStackTrace();
			}

			// }
			session.setAttribute(SysArgs.MPI_BASE_INFO_ID, mpiId);
			return mpi;
		} finally {
			baseInfoLock.writeUnlock(mpiId);
		}
	}

	public static IMPIProvider getMpiProvider() {
		return mpiProvider;
	}

	public static void setMpiProvider(IMPIProvider mpiProvider) {
		MPIProxy.mpiProvider = mpiProvider;
	}
	
	
	public static Map<String, Object> handle(Map<String, Object> mpi){
		//隐藏姓名卡号
		String personName=(String) mpi.get("personName");
		String cardNo=(String) mpi.get("cardNo");
		String contactName=(String) mpi.get("contactName");//联系人
		String contactNo=(String) mpi.get("contactNo");//电话
		String idCard = (String) mpi.get("idCard");//身份证号
		String xing="";
		if(StringUtils.isNotEmpty(personName)){
			if(personName.length()>2){
				personName = personName.substring(0,1)+"*"+personName.substring(personName.length()-1, personName.length());
			}else{
				personName = personName.substring(0,1)+"*";
			}
			mpi.put("personName", personName);
		}
		if(StringUtils.isNotEmpty(cardNo)){
			if(cardNo.length()>5){
				cardNo = cardNo.substring(0,2)+"***"+cardNo.substring(5,cardNo.length());
			}else{
				cardNo = cardNo.substring(0,1)+"***";
			}
			mpi.put("cardNo", cardNo);
		}
		if(StringUtils.isNotEmpty(contactName)){
			xing="";
			for(int i=1;i<contactName.length();i++){
				xing+="*";
			}
			contactName = contactName.substring(0,1)+xing;
			mpi.put("contactName", contactName);
		}
		if(StringUtils.isNotEmpty(contactNo)){
			mpi.put("contactNo",contactNo.replaceAll("(?<=\\d{3})\\d(?=\\d{3})", "*"));
		}
		if(StringUtils.isNotEmpty(idCard)){
			if(idCard.length() >13 && idCard.length()< 19){
				mpi.put("idCard",idCard.substring(0, 6) + "******"+idCard.substring(idCard.length()-2, idCard.length()));
			}
		}
		
		return mpi;
	}

	/**
	 * @param request
	 * @param mpiId
	 * @param mpiService
	 * @return
	 * @throws MPIServiceException
	 */
	// @SuppressWarnings("unchecked")
	// public static Map<String, Object> getDetailMPI(HttpSession session,
	// String mpiId, IMPIProvider mpiService) throws MPIServiceException {
	// try {
	// detailInfoLock.tryReadLock(mpiId);
	// Map<String, Object> info = (Map<String, Object>) session
	// .getAttribute(SysArgs.MPI_DETAIL_INFO);
	// if (mpiId.equals(session.getAttribute(SysArgs.MPI_DETAIL_INFO_ID))
	// && info != null) {
	// return info;
	// }
	// } finally {
	// detailInfoLock.readUnlock(mpiId);
	// }
	// try {
	// detailInfoLock.writeLock(mpiId);
	// Map<String, Object> info = (Map<String, Object>) session
	// .getAttribute(SysArgs.MPI_DETAIL_INFO);
	// if (mpiId.equals(session.getAttribute(SysArgs.MPI_DETAIL_INFO_ID))
	// && info != null) {
	// return info;
	// }
	// Map<String, Object> mpi = mpiService.getMPIDetail(mpiId);
	// Map<String, Object> baseInfo = getBaseMPI(session, mpiId);
	// if (mpi != null && !mpi.isEmpty()) {
	// // mpi = sumMap(baseInfo, mpi);
	// }
	// session.setAttribute(SysArgs.MPI_DETAIL_INFO, mpi);
	// session.setAttribute(SysArgs.MPI_DETAIL_INFO_ID, mpiId);
	// return mpi;
	// } finally {
	// detailInfoLock.writeUnlock(mpiId);
	// }
	// }

	// /**
	// * 合并信息
	// *
	// * @param baseInfo
	// * @param detailInfo
	// * @param contacts
	// * 联系人
	// * @param cards
	// * 卡种类：健康卡、市民卡等
	// * @param contactWays
	// * 病人联系方式
	// * @param addresses
	// * 地址
	// * @param certificates
	// * 证件类型
	// * @throws ControllerException
	// */
	// @SuppressWarnings("unchecked")
	// private static Map<String, Object> sumMap(Map<String, Object> baseInfo,
	// Map<String, Object> detailInfo) throws ControllerException {
	// Map<String, Object> detailInfo2 = new HashMap<String, Object>(baseInfo);
	// for (String key : detailInfo.keySet()) {
	// Object obj = detailInfo.get(key);
	// if (key.equals("contacts")) {
	// List<Map<String, Object>> contacts = (List<Map<String, Object>>) obj;
	// for (Map<String, Object> c : contacts) {
	// detailInfo2.put("contacts1", c);
	// }
	// } else if (key.equals("contactWays")) {
	// List<Map<String, Object>> contactWays = (List<Map<String, Object>>) obj;
	// for (Map<String, Object> cw : contactWays) {
	// detailInfo2.put(
	// "contactTypeCode" + cw.get("contactTypeCode"), cw);
	// }
	// } else if (key.equals("certificates")) {
	// List<Map<String, Object>> certificates = (List<Map<String, Object>>) obj;
	// for (Map<String, Object> c : certificates) {
	// detailInfo2.put("certificates1", c);
	// }
	// }
	// }
	// CXMLDictionary certificateTypeCode = (CXMLDictionary)
	// DictionaryController
	// .instance().get("certificateTypeCode");
	// Map<String, Object> map = new HashMap<String, Object>();
	// for (String key : certificateTypeCode.getItems().keySet()) {
	// map.put(key, certificateTypeCode.getItems().get(key).toString()
	// .split("=")[1]);
	// }
	// Map<String, Object> certificateTypeValue = (Map<String, Object>)
	// detailInfo2
	// .get("certificates1");
	// String ckey = (String) certificateTypeValue.get("certificateTypeCode");
	// Object cvalue = map.get(ckey);
	// detailInfo2.put("certificateTypeValue", cvalue);
	// return detailInfo2;
	// }
}

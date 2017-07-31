package com.bsoft.ehr.service;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import com.bsoft.ehr.config.eval.EvalDictionary;
import com.bsoft.ehr.util.eval.EvalUtil;
import com.bsoft.ehr.util.eval.SimpleDateUtil;
import com.bsoft.xds.support.dao.DefaultDAO;
import com.bsoft.xds.support.dao.DefaultDAOProxy;

import ctd.dictionary.Dictionary;
import ctd.dictionary.DictionaryItem;
import ctd.util.xml.XMLHelper;

public class TableDocUploadService extends BaseService {
	
	private Map<String, String> docs;
	
	private DefaultDAOProxy serviceDao;
	
	private DefaultDAO communityServiceDao;
	
	public void setDocs(Map<String, String> docs) {
		this.docs = docs;
	}

	public void setServiceDao(DefaultDAOProxy serviceDao) {
		this.serviceDao = serviceDao;
	}


	public void setCommunityServiceDao(DefaultDAO communityServiceDao) {
		this.communityServiceDao = communityServiceDao;
	}

	public Map<String, Object> query(String DocID){
		return serviceDao.queryForMap("Table_Doc", "DocID=?",new Object[]{DocID});
	}

	public Map<String, Object> query(String servicename, String DCID){
		return findOne(servicename, "a.DCID='"+DCID+"'");
	}
	
	public Map<String, Object> query(String servicename, String mpiid, String effectiveFlag){
		return findOne(servicename, "a.MPIID='"+mpiid+"' and a.EffectiveFlag='"+effectiveFlag+"'");
	}
	
	public List<Map<String, Object>> query1(String recordclassifying, String mpiid,String effectiveFlag){
		return find(recordclassifying, "a.MPIID='"+mpiid+"' and a.EffectiveFlag='"+effectiveFlag+"'");
	}

	public List<Map<String, Object>> query2(String sql, String id) {
		return communityServiceDao.queryForListSQL(sql, new Object[] { id });
	}
	
	public Document process2(String RecordClassifying,String mpiid,String service,String idCard){
		List<Element> mdl_arrayList = new ArrayList<Element>();
		Document mdl_doc = null;
		InputStream excel_input = null;
		try {
			if (!StringUtils.isEmpty(RecordClassifying)) {
				//xml模板
				File mdl_file = getFile(RecordClassifying,service);
				//excle模板
				File excel_file = getFile(RecordClassifying+"_Doc","excel");
				if (mdl_file.exists() && excel_file.exists()) {
					//excle模板
					excel_input = new FileInputStream(excel_file);
					String type=excel_file.getName().substring(excel_file.getName().lastIndexOf("."));
					//xml模板
					mdl_doc = XMLHelper.getDocument(mdl_file);
					
					if("sharedocs".equals(service)){//共享文档
						//获取个人的基本信息
						getBasicInfo(mdl_doc, mpiid,idCard,service,RecordClassifying);
					}
					
					
					mdl_arrayList = getElement(mdl_doc.getRootElement(),mdl_arrayList);
					try {
						if(".xls".equals(type)){// 2003
							 System.out.println("Excel为2003版本");
						        POIFSFileSystem fileSystem = null;
						        HSSFWorkbook workBook = null;//工作簿
						        fileSystem = new POIFSFileSystem(excel_input);
						        workBook = new HSSFWorkbook(fileSystem);
						        for(int i=0;i<workBook.getNumberOfSheets();i++){
						        	HSSFSheet sheet = workBook.getSheetAt(i);//获取工作簿
						        	getContent2(sheet,mdl_arrayList,service,mpiid,RecordClassifying,idCard);
						        }
						} else if (".xlsx".equals(type)) {// 2007
						        System.out.println("Excel为2007版本");
						        XSSFWorkbook workBook = null;
						        workBook = new XSSFWorkbook(excel_input);
						        for(int i=0;i<workBook.getNumberOfSheets();i++){
						        	 XSSFSheet sheet = workBook.getSheetAt(i);//获取工作簿
						        	 getContent2(sheet,mdl_arrayList,service,mpiid,RecordClassifying,idCard);
						        }
						 }
					} catch (Exception e) {
						e.printStackTrace();
					}
					
					//数据集
					if("dataset".equals(service)){
						for(Element mdl_chileEle: mdl_arrayList){
							String value = mdl_chileEle.attributeValue("value");
							
	                    	String dic = mdl_chileEle.attributeValue("dic");
	                    	String datatype = mdl_chileEle.attributeValue("datatype");
	                    	String mdl_value = "";
                        	if(datatype != null){
                        		mdl_value = EvalUtil.tranToString(datatype, mdl_value,service);
	                			mdl_chileEle.remove(mdl_chileEle.attribute("datatype"));
	                			if(value != null){
	                        		mdl_chileEle.addAttribute("value", mdl_value);
	                        	}
	                		}
	                        if(dic != null){
	                        	if("ICD_10".equals(dic)){
	                				getDic(mdl_chileEle, "", dic);
	                			}else if("ICD_9".equals(dic)){
	                				getDic(mdl_chileEle, "", dic);
	                			}else if("WS_218".equals(dic)){
	                				getDic(mdl_chileEle, "", dic);
	                			}else{
		                        	Dictionary dictionay = EvalDictionary.instance().getDic(dic);
	                    			if(dictionay != null){
	                					Map<String,DictionaryItem> item = dictionay.items();
	                					 for (Entry entry : item.entrySet()) {  
	                						 DictionaryItem d = (DictionaryItem)entry.getValue();
	                						 if(!"true".equals(d.getProperty("folder"))){
	                							 mdl_chileEle.addAttribute("code", d.getKey());
		                						 mdl_chileEle.addAttribute("displayName", d.getText());
		                						 mdl_chileEle.remove(mdl_chileEle.attribute("dic"));
		                    					 break;
	                						 }
	                					 }
	                    			}
	                			}
	                        }
						}
					}
					
					//共享文档
					if("sharedocs".equals(service)){
						for(Element mdl_chileEle: mdl_arrayList){
							String extension = mdl_chileEle.attributeValue("extension");
		            		String value = mdl_chileEle.attributeValue("value");
		            		String code = mdl_chileEle.attributeValue("code");
							
	                    	String datacode = mdl_chileEle.attributeValue("datacode");
	                    	String dic = mdl_chileEle.attributeValue("dic");
	                    	String datatype = mdl_chileEle.attributeValue("datatype");
	                    	String mdl_value = "";
	                        if(datacode != null){
	                        	if(datatype != null){
	                        		mdl_value = EvalUtil.tranToString(datatype, mdl_value,service);
		                			mdl_chileEle.remove(mdl_chileEle.attribute("datatype"));
		                			if(extension != null){
		                        		mdl_chileEle.addAttribute("extension", mdl_value);
		                        	}else if(value != null){
		                        		mdl_chileEle.addAttribute("value", mdl_value);
		                        	}else if(code != null){
		                        		mdl_chileEle.addAttribute("code", mdl_value);
		                        	}else{
		                        		mdl_chileEle.addText(mdl_value);
		                        	}
		                		}
	                        	mdl_chileEle.remove(mdl_chileEle.attribute("datacode"));
	                        }
	                        if(dic != null){
	                        	if("ICD_10".equals(dic)){
	                				getDic(mdl_chileEle, "", dic);
	                			}else if("ICD_9".equals(dic)){
	                				getDic(mdl_chileEle, "", dic);
	                			}else if("WS_218".equals(dic)){
	                				getDic(mdl_chileEle, "", dic);
	                			}else{
		                        	Dictionary dictionay = EvalDictionary.instance().getDic(dic);
	                    			if(dictionay != null){
	                					Map<String,DictionaryItem> item = dictionay.items();
	                					 for (Entry entry : item.entrySet()) {  
	                						 DictionaryItem d = (DictionaryItem)entry.getValue();
	                						 if(!"true".equals(d.getProperty("folder"))){
	                							 mdl_chileEle.remove(mdl_chileEle.attribute("dic"));
		                						 mdl_chileEle.addAttribute("code", d.getKey());
		                						 mdl_chileEle.addAttribute("displayName", d.getText());
		                    					 break;
		                					 }
	                					 }
	                    			}
	                			}
	                        }
	                        
						}
					}
				}
			}
			
		}catch (Exception e) {
			e.printStackTrace();
			try {
				if(excel_input != null){
					excel_input.close();
				}
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		}finally{
			try {
				if(excel_input != null){
					excel_input.close();
				}
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		}
		
		return mdl_doc;
	}
	
	public void getContent2(Sheet sheet, List<Element> mdl_arrayList, String service, String mpiid,
			String RecordClassifying,String idCard) {
		int rowCount = sheet.getPhysicalNumberOfRows();// 行数
		int pos = -1;
		int pos1 = getColNum(sheet, "数据集标志位");
		int pos2 = getColNum(sheet, "创业定义标识符");
		int pos3 = getColNum(sheet, "创业所属数据集");
		
		if("dataset".equals(service)){
			pos = getColNum(sheet, "内部标识符");
		}else if("sharedocs".equals(service)){
			pos = getColNum(sheet, "国家数据元标识符");
		}
		
		Map<String,Object> tableMap=new HashMap<String, Object>();
		for (int n = 2; n <= rowCount; n++) {// 遍历excel模板字段列,从第二行开始
			Row row = sheet.getRow(n);
			if (row == null) {
				continue;
			}
			if(row.getCell(pos)==null){
				continue;
			}
			
			Cell cell = row.getCell(pos);
	    	cell.setCellType(Cell.CELL_TYPE_STRING);
	    	String excelkey = String.valueOf(cell.getStringCellValue());
			Cell cell1 = row.getCell(pos1);
	    	cell1.setCellType(Cell.CELL_TYPE_STRING);
			String excel_flag = row.getCell(pos1) == null ? "" : row.getCell(pos1).getStringCellValue();
			String excel_field =row.getCell(pos2) == null ? "" : row.getCell(pos2).getStringCellValue();
			String tablename = row.getCell(pos3) == null ? "" : row.getCell(pos3).getStringCellValue();
			if(!excelkey.isEmpty()){
				Object content = null;
				List<Map<String, Object>> list=new ArrayList<Map<String,Object>>();
				if(!tableMap.containsKey(tablename)){//单次查询数据集
					try {
						if("1".equals(excel_flag)){//中心
							list = query1(tablename, mpiid, "0");
						}
//						else if("2".equals(excel_flag)){//社区
//							String sql="";//社区表
//							String sql2="select t.empiid as empiid from mpi_certificate t where t.certificateno=?";
//							String empiid="";//社区表empiid
//							List<Map<String, Object>> empilist = query2(sql2,idCard);
//							if (empilist != null && !empilist.isEmpty()) {
//								empiid=(String) empilist.get(0).get("EMPIID");
//							}
//							
//							if("JS01".equals(tablename)){//精神病业务找中心数据
//								sql = "select * from js01, js02,js03,js04,js05,js06,js07 " +
//										"where js01.id = js02.zxdaid(+)  and js01.id = js03.zxdaid(+) and js01.id= js04.zxdaid(+) " +
//										"and js01.id= js05.zxdaid(+) and js01.id= js06.zxdaid(+)  and js01.id= js07.zxdaid(+) and js01.sfzh = ? ";
//							}
//							
//							if("PatientBasicInfo".equals(tablename)){//
//								sql = "select t.personname as name, t.sexcode as sex,t.idcard,t.birthday as birthdatetime,t.rhbloodcode as rhbloodcode,t.bloodtypecode as abobloodcode from mpi_demographicinfo t where empiid=?";
//							}
//							
//							if("csyxzm01".equals(tablename)){//出生医学证明
//								sql = "select deliveryCode as csyxzmbh,motherPlace as yljgmc,babyBirthday as cssj,"
//										+ " fatherNationality as fqgj,motherNationality as mqgj,fatherNation as fqmz,"
//										+ " motherNation as mqmz,fatherCardNo as fqsfzh,motherCardNo as mqsfzhm,"
//										+ " drdeliveryName as jsrxm,fatherName as fqxm,motherName as mqxm,"
//										+ " babyName as xsexm,babySex as xsexbdm,gestation as csyz,"
//										+ " birthHeight as cssc,birthWeight as cstz,createUnit as qzjgmc"
//										+ " from CDH_DeliveryRecord where empiid=? ";
//							}
//							if("crb01".equals(tablename)){//传染病
//								sql="select card_code as crbbgkbh,birthday_date as csrq,group_id as crbzydm,telp as dhhm,"
//										+ " id as sfzjhm,filltime as tbrq,deaddate as sqrq,diagnosedate as zdrq,inputdoctor as bgysxm,"
//										+ " parent_name as jzxm,patient_name as brxm,sex1 as xbdm,start_date as cxzzrq,"
//										+ " disease_id1 as crbfblbdm,casetype as crblbdm,unit as gzdwmc,rptorgcode as tbjgmc"
//										+ " from INFECTIONCARD where id=?";
//							}
//
//							if("swyxzm01".equals(tablename)){//死亡医学证明
//								sql = "select deadRegisterId as swyxzmbh,inputDate as tbrqsj,birthday as csrq,"
//										+ " idCard as zfzjhm,deathYear as sznl,"
//										+ " deathAddress as swddlbdm,deathDate as swrqsj,inputUser as tbrxm,"
//										+ " childName as xm,childSex as xb,diagnoseLevel as swzgzdyjlbdm,"
//										+ " inputUnit as tbjgmc,diagnoseUnit as swyymc,reasonBasis as gbswyydm"
//										+ " from CDH_DeadRegister where empiid=?";
//							}
//
//							if("yfjz01".equals(tablename)){//预防接种
//								sql="select l.phrId as phrId,l.vaccinateUser as brxm,l.times as jzjc,l.reactionDate as blfyfsrq,"
//										+ " l.reactionCode as blfyzddm,l.vaccinateUnit as ymjzdwmc,l.vaccineBN as ymph,l.vaccinateDate as ymjzrq,"
//										+ " l.reactionTreat as blfyzddm,l.vaccineCode as ymmcdm,r.cardNo as yfjzkbh"
//										+ " from piv_vaccinatelist l ,piv_vaccinaterecord r where l.phrid = r.phrid  and r.empiid=?";
//							}
//							
//							if (!"".equals(sql)) {
//								if("JS01".equals(tablename)){
//									list = serviceDao.queryForListSQL(sql, new Object[]{idCard});
//								}else{
//									if("".equals(empiid)){
//										 empiid = mpiid;
//									}
//									list = query2(sql, empiid);
//								}
//								
//							}
//						}
					} catch (Exception e) {//没有表
						tableMap.put(tablename,content);
						e.printStackTrace();
						continue;
					}
					if(list == null || list.isEmpty()){
						tableMap.put(tablename,content);
						continue;
					}
					if("1".equals(excel_flag)){
						content = (String) list.get(0).get("DOCCONTENT");
					}else if("2".equals(excel_flag)){
						content = list.get(0);
					}
					tableMap.put(tablename, content);
				}else{
					content = tableMap.get(tablename);
				}
				if (content != null) {
					try {
						if("1".equals(excel_flag)){//中心
							List<Element> tbl_arrayList = new ArrayList<Element>();
							Document tbl_doc = DocumentHelper.parseText((String) content);//表文档
							tbl_arrayList = getElement(tbl_doc.getRootElement(),tbl_arrayList);
							
							if("dataset".equals(service)){
								getDatasetMdl(excelkey, mdl_arrayList, tbl_arrayList,excel_field,service);//数据集
							}else if("sharedocs".equals(service)){
								getSharedocsMdl(excelkey, mdl_arrayList, tbl_arrayList,excel_field,service);//共享文档
							}
						}else if("2".equals(excel_flag)){//社区
							if("dataset".equals(service)){
								getDatasetMdl2(excelkey, mdl_arrayList, content,excel_field,service);//数据集
							}else if("sharedocs".equals(service)){
								getSharedocsMdl2(excelkey, mdl_arrayList, content,excel_field,service);//共享文档
							}
						}
						
					}catch (Exception e){
						e.printStackTrace();
					}
						
				}
				
				
			}
		}
    }
	
    @SuppressWarnings("rawtypes")
	private List<Element> getElement(Element element,List<Element> arrayList){    
        List list = element.elements();    
        //递归方法     
        for(Iterator its =  list.iterator();its.hasNext();){    
            Element chileEle = (Element)its.next();
            arrayList.add(chileEle);
            arrayList = getElement(chileEle,arrayList); 
        }
        return arrayList;
    }
    
    private String getValue(Cell cell) {  
        if (cell.getCellType() == Cell.CELL_TYPE_BOOLEAN) {  
            // 返回布尔类型的值  
            return String.valueOf(cell.getBooleanCellValue());  
        } else if (cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {  
            // 返回数值类型的值  
            return String.valueOf(cell.getNumericCellValue());  
        } else {  
            // 返回字符串类型的值  
            return String.valueOf(cell.getStringCellValue());  
        }  
    } 
	
    private  void getDic(Element chileEle,String excelvalue,String dic){
    	if("".equals(excelvalue) || excelvalue == null){
    		Map<String, Object> m = serviceDao.queryForMap(dic, "rownum<2", new Object[]{});
			chileEle.addAttribute("code", (String)m.get("KEY"));
			chileEle.addAttribute("displayName", (String)m.get("VALUE"));
			chileEle.remove(chileEle.attribute("dic"));
    	}else{
    		Map<String, Object> map = serviceDao.queryForMap(dic, "KEY=?", new Object[]{excelvalue});
    		if(map != null){
    			String displayName = (String)map.get("VALUE");
    			chileEle.addAttribute("code", excelvalue);
    			chileEle.addAttribute("displayName", displayName);
    			chileEle.remove(chileEle.attribute("dic"));
    		}
    	}
    }
    
    private int getColNum(Sheet sheet,String cell_field){
        int rowCount = sheet.getPhysicalNumberOfRows();//行数
        int pos = 0;
        for(int i=0;i<=rowCount;i++){//遍历行，略过标题行，从第二行开始
            Row row = sheet.getRow(i);
            if(row == null){
            	continue;
            }
            if(pos == 0){
            	int cellCount = row.getPhysicalNumberOfCells();
                for(int j=0;j<cellCount;j++){//遍历行单元格
                	Cell cell = row.getCell(j);
                	if(cell != null){
                		if(cell_field.equals(getValue(cell))){
                    		pos = j;
                    		break;
                    	}
                	}
                }
            }else{
            	break;
            }
        }
        return pos;
    }
    
    private void getDatasetMdl(String excelkey,List<Element> mdl_arrayList,List<Element> tbl_arrayList,String excel_field,String service){
		for (Element chileEle : mdl_arrayList) {// 遍历xml模板
        	String datacode = chileEle.getName();
            if(datacode != null){
            	if(datacode.equals(excelkey)){
            		String mdl_value = chileEle.attributeValue("value");
            		String code = chileEle.attributeValue("code");
            		String datatype = chileEle.attributeValue("datatype");
            		
            		for(Element tbl_chileEle: tbl_arrayList){// 遍历表文档
						String tbl_field = tbl_chileEle.getName();
						String tbl_value = tbl_chileEle.getText();
						if(excel_field.equalsIgnoreCase(tbl_field)){
							
							if(mdl_value != null){
		                		if(datatype != null){
		                    		tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                    		chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addAttribute("value", tbl_value);
		                		break;
		                	}else if(code != null){
		                		//判断dic有没值，要转字典
		                		String dic = chileEle.attributeValue("dic");
		                		if(dic != null){
		                			if("ICD_10".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("ICD_9".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("WS_218".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else{
		                				Dictionary dictionay = EvalDictionary.instance().getDic(dic);
		                    			if(dictionay != null){
		                    				String displayName = dictionay.getText(tbl_value);
		                    				if(!"".equals(displayName)){
		                    					chileEle.addAttribute("code", tbl_value);
		                    					chileEle.addAttribute("displayName", displayName);
		                    					chileEle.remove(chileEle.attribute("dic"));
		                    				}else{
		                    					Map<String,DictionaryItem> item = dictionay.items();
		                    					 for (Entry entry : item.entrySet()) {  
		                    						 DictionaryItem d = (DictionaryItem)entry.getValue();
		                    						 chileEle.addAttribute("code", d.getKey());
			                    					 chileEle.addAttribute("displayName", d.getText());
			                    					 chileEle.remove(chileEle.attribute("dic"));
			                    					 break;
		                    					 }
		                        			}
		                        			
		                    			}
		                			}
		                		}
		                		if(datatype != null){
		                    		chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		break;
		                	}
						}
					}
            		break;
            	}
            }
        }
    }
    
    private void getDatasetMdl2(String excelkey,List<Element> mdl_arrayList,Object content,String excel_field,String service){
		Map map = (Map) content;
    	
		for (Element chileEle : mdl_arrayList) {// 遍历xml模板
        	String datacode = chileEle.getName();
            if(datacode != null){
            	if(datacode.equals(excelkey)){
            		String mdl_value = chileEle.attributeValue("value");
            		String code = chileEle.attributeValue("code");
            		String datatype = chileEle.attributeValue("datatype");
            		
            		for(Object key_field: map.keySet()){// 遍历社区表
            			String tbl_field =(String)key_field;
            			String tbl_value = "";
            			try{
            				tbl_value = (String)map.get(tbl_field);
            			}catch (Exception e) {
							try{
								tbl_value = SimpleDateUtil.formatDate((Date)map.get(tbl_field)) ;
							}catch (Exception ex) {
								tbl_value = String.valueOf(map.get(tbl_field));
							}
						}
						if(excel_field.equalsIgnoreCase(tbl_field)){
							if(mdl_value != null){
		                		if(datatype != null){
		                    		tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                    		chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addAttribute("value", tbl_value);
		                		break;
		                	}else if(code != null){
		                		//判断dic有没值，要转字典
		                		String dic = chileEle.attributeValue("dic");
		                		if(dic != null){
		                			if("ICD_10".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("ICD_9".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("WS_218".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else{
		                				Dictionary dictionay = EvalDictionary.instance().getDic(dic);
		                    			if(dictionay != null){
		                    				String displayName = dictionay.getText(tbl_value);
		                    				if(!"".equals(displayName)){
		                    					chileEle.addAttribute("code", tbl_value);
		                    					chileEle.addAttribute("displayName", displayName);
		                    					chileEle.remove(chileEle.attribute("dic"));
		                    				}else{
		                    					Map<String,DictionaryItem> item = dictionay.items();
		                    					 for (Entry entry : item.entrySet()) {  
		                    						 DictionaryItem d = (DictionaryItem)entry.getValue();
		                    						 chileEle.addAttribute("code", d.getKey());
			                    					 chileEle.addAttribute("displayName", d.getText());
			                    					 chileEle.remove(chileEle.attribute("dic"));
			                    					 break;
		                    					 }
		                        			}
		                    			}
		                			}
		                		}
		                		if(datatype != null){
		                    		chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		break;
		                	}
						}
					}
            		break;
            	}
            }
        }
    }
	
	public void getSharedocsMdl(String excelkey, List<Element> mdl_arrayList,List<Element> tbl_arrayList,String excel_field,String service) {
        for(Element chileEle: mdl_arrayList){
        	String datacode = chileEle.attributeValue("datacode");
            if(datacode != null){
            	if(datacode.equals(excelkey)){
            		String extension = chileEle.attributeValue("extension");
            		String value = chileEle.attributeValue("value");
            		String code = chileEle.attributeValue("code");
            		String datatype = chileEle.attributeValue("datatype");
            		
            		for(Element tbl_chileEle: tbl_arrayList){// 遍历表文档
						String tbl_field = tbl_chileEle.getName();
						
						String tbl_value = "";
						
						if(tbl_chileEle.attribute("localText") != null){
							tbl_value = tbl_chileEle.attribute("localText").getValue();
						}else{
							tbl_value = tbl_chileEle.getText();
						}
						
						if(excel_field.equalsIgnoreCase(tbl_field)){
							
							if(extension != null){
		                		if(datatype != null){
		                			tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                			chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addAttribute("extension", tbl_value);
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}else if(value != null){
		                		if(datatype != null){
		                			tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                			chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addAttribute("value", tbl_value);
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}else if(code != null){
		                		//判断dic有没值，要转字典
		                		String dic = chileEle.attributeValue("dic");
		                		if(dic != null){
		                			if("ICD_10".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("ICD_9".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("WS_218".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else{
		                				Dictionary dictionay = EvalDictionary.instance().getDic(dic);
		                    			if(dictionay != null){
		                    				String displayName = dictionay.getText(tbl_value);
		                    				if(!"".equals(displayName)){
		                    					chileEle.addAttribute("code", tbl_value);
		                    					chileEle.addAttribute("displayName", displayName);
		                    					chileEle.remove(chileEle.attribute("dic"));
		                    				}else{
		                    					Map<String,DictionaryItem> item = dictionay.items();
		                    					 for (Entry entry : item.entrySet()) {  
		                    						 DictionaryItem d = (DictionaryItem)entry.getValue();
		                    						 chileEle.addAttribute("code", d.getKey());
			                    					 chileEle.addAttribute("displayName", d.getText());
			                    					 chileEle.remove(chileEle.attribute("dic"));
			                    					 break;
		                    					 }
		                    				}
		                    			}
		                			}
		                		}
		                		if(datatype != null){
		                    		chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}else{
		                		if(datatype != null){
		                			tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                			chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addText(tbl_value);
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}
		                	
						}

					}
            		//break;
				}
			}
		}
    }
    

	public void getSharedocsMdl2(String excelkey, List<Element> mdl_arrayList,Object content,String excel_field,String service) {
		Map map = (Map) content;
        for(Element chileEle: mdl_arrayList){
        	String datacode = chileEle.attributeValue("datacode");
            if(datacode != null){
            	if(datacode.equals(excelkey)){
            		String extension = chileEle.attributeValue("extension");
            		String value = chileEle.attributeValue("value");
            		String code = chileEle.attributeValue("code");
            		String datatype = chileEle.attributeValue("datatype");
            		
            		for(Object key_field: map.keySet()){// 遍历社区表
            			String tbl_field =(String)key_field;
            			String tbl_value = "";
            			try{
            				tbl_value = (String)map.get(tbl_field);
            			}catch (Exception e) {
							try{
								tbl_value = SimpleDateUtil.formatDate((Date)map.get(tbl_field)) ;
							}catch (Exception ex) {
								tbl_value = String.valueOf(map.get(tbl_field));
							}
						}
						
						if(excel_field.equalsIgnoreCase(tbl_field)){
							if(extension != null){
		                		if(datatype != null){
		                			tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                			chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addAttribute("extension", tbl_value);
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}else if(value != null){
		                		if(datatype != null){
		                			tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                			chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addAttribute("value", tbl_value);
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}else if(code != null){
		                		//判断dic有没值，要转字典
		                		String dic = chileEle.attributeValue("dic");
		                		if(dic != null){
		                			if("ICD_10".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("ICD_9".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else if("WS_218".equals(dic)){
		                				getDic(chileEle, tbl_value, dic);
		                			}else{
		                				Dictionary dictionay = EvalDictionary.instance().getDic(dic);
		                    			if(dictionay != null){
		                    				String displayName = dictionay.getText(tbl_value);
		                    				if(!"".equals(displayName)){
		                    					chileEle.addAttribute("code", tbl_value);
		                    					chileEle.addAttribute("displayName", displayName);
		                    					chileEle.remove(chileEle.attribute("dic"));
		                    				}else{
		                    					Map<String,DictionaryItem> item = dictionay.items();
		                    					 for (Entry entry : item.entrySet()) {  
		                    						 DictionaryItem d = (DictionaryItem)entry.getValue();
		                    						 chileEle.addAttribute("code", d.getKey());
			                    					 chileEle.addAttribute("displayName", d.getText());
			                    					 chileEle.remove(chileEle.attribute("dic"));
			                    					 break;
		                    					 }
		                    				}
		                        			
		                    			}
		                			}
		                		}
		                		if(datatype != null){
		                    		chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}else{
		                		if(datatype != null){
		                			tbl_value = EvalUtil.tranToString(datatype, tbl_value,service);
		                			chileEle.remove(chileEle.attribute("datatype"));
		                		}
		                		chileEle.addText(tbl_value);
		                		chileEle.remove(chileEle.attribute("datacode"));
		                		break;
		                	}
		                	
						}

					}
            		break;
				}
			}
		}
    }
	
    private File getFile(String RecordClassifying,String service){
		String docspath=this.getClass().getClassLoader().getResource("").getPath();
		File file = null;
		if(docspath != null){
			// str会得到这个函数所在类的路径
			String str = docspath.substring(1, docspath.length());
			// 将%20换成空格（如果文件夹的名称带有空格的话，会在取得的字符串上变成%20）
			str = str.replaceAll("%20", " ");
			// 查找“WEB-INF”在该字符串的位置
			int num = str.indexOf("WEB-INF");
			// 截取即可
			str = str.substring(0, num + "WEB-INF".length() + 1);
			String docspath2 = "config/" + service + "/" + docs.get(RecordClassifying);
			//模板文件
			file = new File(str+docspath2);
		}
	
		return file;
    }
    
    
    @SuppressWarnings({ "rawtypes", "unchecked" })
	private void getBasicInfo(Document mdl_doc,String mpiid,String idCard,String service,String RecordClassifying){
    	
    	SAXReader reader1 = new SAXReader();
		Map<String, String> m=new HashMap<String, String>();
		m.put("EMR","urn:hl7-org:v3");
		reader1.getDocumentFactory().setXPathNamespaceURIs(m);
		
		
		if("Birth_Certificate".equals(RecordClassifying)){//出生证明
			RecordClassifying = "csyxzm01";
		}
		//获取文档创作者
		getDoctorAndOrg(mdl_doc, mpiid, RecordClassifying);
		
		 
    	try{
    		//社区 获取父母信息
//    		String psql = "select b.sexcode,b.personname, b.birthday,b.workcode,case when b.mobilenumber is null then b.phonenumber else b.mobilenumber end as mobile from cdh_healthcard t, mpi_certificate a, mpi_demographicinfo b where t.empiid = a.empiid and a.certificateno = ? and t.fatherempiid(+) = b.empiid " +
//  				  "union all " +
//  				  "select b.sexcode,b.personname, b.birthday,b.workcode,case when b.mobilenumber is null then b.phonenumber else b.mobilenumber end as mobile from cdh_healthcard t, mpi_certificate a, mpi_demographicinfo b where t.empiid = a.empiid and a.certificateno = ? and t.motherempiid(+) = b.empiid";
//  	
//		  	List<Element> list = mdl_doc.selectNodes("EMR:ClinicalDocument/EMR:recordTarget/EMR:patientRole/EMR:patient/EMR:guardian");
//		  	List<Map<String, Object>> pl = communityServiceDao.queryForListSQL(psql, new Object[]{idCard,idCard});
//		  	if(!list.isEmpty() && list.size()==1){
//		  		if(pl != null && !pl.isEmpty()){
//		      		Map map = pl.get(0);
//		      		getParentInfoElement(list.get(0), map,service);
//		  		}
//		  	}else if(list.size()==2){
//		  		if(pl != null && !pl.isEmpty()){
//		  			if(pl.size()==2){
//		  				for(int i=0;i<pl.size();i++){
//		      				Map map = pl.get(i);
//		              		getParentInfoElement(list.get(i), map,service);
//		      			}
//		  			}else if(pl.size()==1){
//		  				Map map = pl.get(0);
//		  				if("1".equals((String)map.get("SEXCODE"))){//father
//		  					getParentInfoElement(list.get(0), map,service);
//		  				}else{
//		  					getParentInfoElement(list.get(1), map,service);
//		  				}
//		  			}
//		  		}
//		  	}
				
		  	
    		if(!"csyxzm01".equals(RecordClassifying)){//出生证明
    			
				//中心 获取个人信息
			  	//List<Map<String, Object>> l = communityServiceDao.queryForListSQL("select a.address,t.workcode,t.workplace, t.educationcode,t.personname,t.birthday,t.sexcode,t.nationcode,t.maritalstatuscode,m.certificateno from mpi_demographicinfo t,mpi_certificate m,mpi_address a where t.mpiid = m.mpiid (+) and t.mpiid=a.mpiid (+) and t.mpiid = ?", new Object[]{mpiid});
			  	
	    		List<Map<String, Object>> l = communityServiceDao.queryForListSQL("select a.address as ADDRESS,t.workcode as WORKCODE,t.workplace as WORKPLACE, t.educationcode as EDUCATIONCODE," +
	    				"t.personname as PERSONNAME,t.birthday as BIRTHDAY,t.sexcode as SEXCODE,t.nationcode as NATIONCODE," +
	    				"t.maritalstatuscode as MARITALSTATUSCODE,m.certificateno as CERTIFICATENO from mpi_demographicinfo t left join mpi_certificate m on t.mpiid = m.mpiid left join  mpi_address a on t.mpiid=a.mpiid where  t.mpiid = ?", new Object[]{mpiid});
			  	
			  	
			  	if(l != null && !l.isEmpty()){
			  		Map map = l.get(0);
			  	
			  		Element num = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:recordTarget/EMR:patientRole/EMR:addr/EMR:houseNumber");
			  		if(num != null){
			  			
			  			String address = String.valueOf(map.get("ADDRESS"));
			  			
			  			if(address != null && !"".equals(address)){
			  				String datacode = num.attributeValue("datacode");
					   		String datatype = num.attributeValue("datatype");
				    		if(datacode != null){
				    			num.remove(num.attribute("datacode"));
				    		}
				    		if(datatype != null){
				    			num.remove(num.attribute("datatype"));
				    		}
				    		num.setText(address);
			  			}
			  		}
			  		
			  		Element element = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:recordTarget/EMR:patientRole/EMR:patient");
			  		if(element != null){
			  			getInfoElement(element, map,service);
			  	   }
			  	}
    		}
    	}catch (Exception e) {
			e.printStackTrace();
		}
    	
    	
    }
    private void getParentInfoElement(Element element,Map map,String service){
    	String mpi_value = "";
    	String personname = (String)map.get("PERSONNAME");
		String birthday =SimpleDateUtil.formatDate((Date)map.get("BIRTHDAY")) ;
		String workcode = (String)map.get("WORKCODE");
		String mobile = (String)map.get("MOBILE");
		List elements = element.elements();
   	 	for (Iterator it = elements.iterator(); it.hasNext();) {
	       	Element ele = (Element) it.next(); 
	       	String text = ele.getName();
	       	if("name".equals(text)){
	       		mpi_value = personname;
	       	}else if("birthTime".equals(text)){
	       		mpi_value = birthday;
	       	}else if("occupationCode".equals(text)){
	       		mpi_value = workcode;
	       	}else if("telecom".equals(text)){
	       		mpi_value = mobile;
	       	}
	       	String datacode = ele.attributeValue("datacode");
	       	String extension = ele.attributeValue("extension");
	       	String value = ele.attributeValue("value");
	   		String code = ele.attributeValue("code");
	   		String datatype = ele.attributeValue("datatype");
	   		if(datacode != null){
	   			if(extension != null){
	   				if(datatype != null){
	   					mpi_value = EvalUtil.tranToString(datatype, mpi_value,service);
	   					ele.remove(ele.attribute("datatype"));
	           		}
	   				ele.addAttribute("extension", mpi_value);
	   				ele.remove(ele.attribute("datacode"));
	   			}else if(value != null){
	           		if(datatype != null){
	           			mpi_value = EvalUtil.tranToString(datatype, mpi_value,service);
	               		ele.remove(ele.attribute("datatype"));
	           		}
	           		ele.addAttribute("value", mpi_value);
	           		ele.remove(ele.attribute("datacode"));
	           	}else if(code != null){
	           		//判断dic有没值，要转字典
	           		String dic = ele.attributeValue("dic");
	           		if(dic != null){
	           			if("ICD_10".equals(dic)){
	           				getDic(ele, mpi_value, dic);
	           			}else if("ICD_9".equals(dic)){
	           				getDic(ele, mpi_value, dic);
	           			}else if("WS_218".equals(dic)){
	           				getDic(ele, mpi_value, dic);
	           			}else{
	           				Dictionary dictionay = EvalDictionary.instance().getDic(dic);
	               			if(dictionay != null){
	               				String displayName = dictionay.getText(mpi_value);
	               				if(!"".equals(displayName)){
	               					ele.addAttribute("code", mpi_value);
	               					ele.addAttribute("displayName", displayName);
	               					ele.remove(ele.attribute("dic"));
	               				}else{
	               					Map<String,DictionaryItem> item = dictionay.items();
	                  					 for (Entry entry : item.entrySet()) {  
	                  						 DictionaryItem d = (DictionaryItem)entry.getValue();
	                  						 ele.addAttribute("code", d.getKey());
	                  						 ele.addAttribute("displayName", d.getText());
	                  						 ele.remove(ele.attribute("dic"));
	                  						 break;
	                  					 }
	               				}
	               			}
	           			}
	           			if(datatype != null){
		   					ele.remove(ele.attribute("datatype"));
		           		}
	           			ele.remove(ele.attribute("datacode"));
	           		}
	           	}else{
	           		if(datatype != null){
	   					mpi_value = EvalUtil.tranToString(datatype, mpi_value,service);
	   					ele.remove(ele.attribute("datatype"));
	           		}
	           		ele.addText(mpi_value);
	           		ele.remove(ele.attribute("datacode"));
	           	}
	   		}
	   		mpi_value = "";
	   		getParentInfoElement(ele, map,service);
	      }
    }
    
    private void getInfoElement(Element element,Map map,String service){
    	String mpi_value = "";
		String personname = (String)map.get("PERSONNAME");
		String birthday =SimpleDateUtil.formatDate((Date)map.get("BIRTHDAY")) ;
		String sexcode = String.valueOf(map.get("SEXCODE"));
		String nationcode = (String)map.get("NATIONCODE");
		String maritalstatuscode = (String)map.get("MARITALSTATUSCODE");
		String workcode = (String)map.get("WORKCODE");
		String workplace = (String)map.get("WORKPLACE");
		String educationcode = (String)map.get("EDUCATIONCODE");
		String certificateno = (String)map.get("CERTIFICATENO");
    	List elements = element.elements();
    	 for (Iterator it = elements.iterator(); it.hasNext();) {
	       	Element ele = (Element) it.next(); 
	       	String text = ele.getName();
	       	if("name".equals(text)){
	       		mpi_value = personname;
	       	}else if("administrativeGenderCode".equals(text)){
	       		mpi_value = sexcode;
	       	}else if("birthTime".equals(text)){
	       		mpi_value = birthday;
	       	}else if("maritalStatusCode".equals(text)){
	       		mpi_value = maritalstatuscode;
	       	}else if("ethnicGroupCode".equals(text)){
	       		mpi_value = nationcode;
	       	}else if("id".equals(text)){
	       		mpi_value = certificateno;
	       	}else if("educationLevelCode".equals(text)){
	       		mpi_value = educationcode;
	       	}else if("occupationCode".equals(text)){
	       		mpi_value = workcode;
	       	}
	       	String datacode = ele.attributeValue("datacode");
	       	String extension = ele.attributeValue("extension");
	       	String value = ele.attributeValue("value");
	   		String code = ele.attributeValue("code");
	   		String datatype = ele.attributeValue("datatype");
	   		if(datacode != null){
	   			if(extension != null){
	   				if(datatype != null){
	   					mpi_value = EvalUtil.tranToString(datatype, mpi_value,service);
	   					ele.remove(ele.attribute("datatype"));
	           		}
	   				ele.addAttribute("extension", mpi_value);
	   				ele.remove(ele.attribute("datacode"));
	   			}else if(value != null){
	           		if(datatype != null){
	           			mpi_value = EvalUtil.tranToString(datatype, mpi_value,service);
	               		ele.remove(ele.attribute("datatype"));
	           		}
	           		ele.addAttribute("value", mpi_value);
	           		ele.remove(ele.attribute("datacode"));
	           	}else if(code != null){
	           		//判断dic有没值，要转字典
	           		String dic = ele.attributeValue("dic");
	           		if(dic != null){
	           			if("ICD_10".equals(dic)){
	           				getDic(ele, mpi_value, dic);
	           			}else if("ICD_9".equals(dic)){
	           				getDic(ele, mpi_value, dic);
	           			}else if("WS_218".equals(dic)){
	           				getDic(ele, mpi_value, dic);
	           			}else{
	           				Dictionary dictionay = EvalDictionary.instance().getDic(dic);
	               			if(dictionay != null){
	               				String displayName = dictionay.getText(mpi_value);
	               				if(!"".equals(displayName)){
	               					ele.addAttribute("code", mpi_value);
	               					ele.addAttribute("displayName", displayName);
	               					ele.remove(ele.attribute("dic"));
	               				}else{
	               					Map<String,DictionaryItem> item = dictionay.items();
	                  					 for (Entry entry : item.entrySet()) {  
	                  						 DictionaryItem d = (DictionaryItem)entry.getValue();
	                  						 ele.addAttribute("code", d.getKey());
	                  						 ele.addAttribute("displayName", d.getText());
	                  						 ele.remove(ele.attribute("dic"));
	                  						 break;
	                  					 }
	               				}
	               			}
	           			}
	           			if(datatype != null){
		   					ele.remove(ele.attribute("datatype"));
		           		}
	           			ele.remove(ele.attribute("datacode"));
	           		}
	           	}else{
	           		if(datatype != null){
	   					mpi_value = EvalUtil.tranToString(datatype, mpi_value,service);
	   					ele.remove(ele.attribute("datatype"));
	           		}
	           		ele.addText(mpi_value);
	           		ele.remove(ele.attribute("datacode"));
	           	}
	   		}
	   		mpi_value = "";
	   		getInfoElement(ele, map,service);
   		
	      }
    }
    
    private void getDoctorAndOrg(Document mdl_doc,String mpiid,String RecordClassifying){
    	
    	Dictionary auth = EvalDictionary.instance().getDic("authororganization");
    	String authororganization ="";
    	String authororganizationname = "";
    	String authororganizationaddr = "";
    	String author = "";
    	String custodianname = "";
    	String custodiantelecom = "";
    	String custodianaddr = "";
    	if(auth != null){
    		authororganization = auth.getText("authororganization");
    		authororganizationname = auth.getText("authororganizationname");
    		authororganizationaddr = auth.getText("authororganizationaddr");
    		author = auth.getText("author");
    		custodianname = auth.getText("custodianname");
        	custodiantelecom = auth.getText("custodiantelecom");
        	custodianaddr = auth.getText("custodianaddr");
    	}
		
		try{
			List<Map<String, Object>> list = serviceDao.queryForList(RecordClassifying, "MPIID=?  and EffectiveFlag = ?", new Object[]{mpiid,"0"});
//					query1(RecordClassifying, mpiid, "0");
    		if(list != null && !list.isEmpty()){
    			Map map = list.get(0);
    			if(String.valueOf(map.get("AUTHOR")) != null && !"".equals(String.valueOf(map.get("AUTHOR")))){
    				author = String.valueOf(map.get("AUTHOR"));
    			}
    			
    			if(String.valueOf(map.get("AUTHORORGANIZATION")) != null && !"".equals(String.valueOf(map.get("AUTHORORGANIZATION"))) && String.valueOf(map.get("AUTHORORGANIZATION")).length() == 22){
    				authororganization = String.valueOf(map.get("AUTHORORGANIZATION"));
    				Dictionary org = EvalDictionary.instance().getDic("authororganization_text");
    				Dictionary addr = EvalDictionary.instance().getDic("authororganization_addr");
           			if(org != null){
           				String orgname = org.getText(authororganization);
           				if(!"".equals(orgname)){
           					authororganizationname = orgname;
           				}
           			}
           			if(addr != null){
           				String addrname = addr.getText(authororganization);
           				if(!"".equals(addrname)){
           					authororganizationaddr = addrname;
           				}
           			}
    			}
    			
    		}
		}catch (Exception e) {
			e.printStackTrace();
		}
		
			
			
//    	Element id = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:author/EMR:assignedAuthor/EMR:id");
//    	if(id != null){
//    		String datacode = id.attributeValue("datacode");
//	   		String datatype = id.attributeValue("datatype");
//    		if(datacode != null){
//    			id.remove(id.attribute("datacode"));
//    		}
//    		if(datatype != null){
//    			id.remove(id.attribute("datatype"));
//    		}
//    		String extension = id.attributeValue("extension");
//    		if(extension != null){
//    			id.addAttribute("extension", "");
//    		}
//    	}
    	
    	Element name = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:author/EMR:assignedAuthor/EMR:assignedPerson/EMR:name");
    	if(name != null){
    		String datacode = name.attributeValue("datacode");
	   		String datatype = name.attributeValue("datatype");
    		if(datacode != null){
    			name.remove(name.attribute("datacode"));
    		}
    		if(datatype != null){
    			name.remove(name.attribute("datatype"));
    		}
    		name.setText(author);
    	}
    	
    	Element org_id = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:author/EMR:assignedAuthor/EMR:representedOrganization/EMR:id");
    	if(org_id != null){
    		String datacode = org_id.attributeValue("datacode");
	   		String datatype = org_id.attributeValue("datatype");
    		if(datacode != null){
    			org_id.remove(org_id.attribute("datacode"));
    		}
    		if(datatype != null){
    			org_id.remove(org_id.attribute("datatype"));
    		}
    		String extension = org_id.attributeValue("extension");
    		if(extension != null){
    			org_id.addAttribute("extension", authororganization.substring(0, 10));
    		}
    	}
    	
    	Element org_name = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:author/EMR:assignedAuthor/EMR:representedOrganization/EMR:name");
    	if(org_name != null){
    		String datacode = org_name.attributeValue("datacode");
	   		String datatype = org_name.attributeValue("datatype");
    		if(datacode != null){
    			org_name.remove(org_name.attribute("datacode"));
    		}
    		if(datatype != null){
    			org_name.remove(org_name.attribute("datatype"));
    		}
    		org_name.setText(authororganizationname);
    	}
    	
    	Element org_addr = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:author/EMR:assignedAuthor/EMR:representedOrganization/EMR:addr");
    	if(org_addr != null){
    		String datacode = org_addr.attributeValue("datacode");
	   		String datatype = org_addr.attributeValue("datatype");
    		if(datacode != null){
    			org_addr.remove(name.attribute("datacode"));
    		}
    		if(datatype != null){
    			org_addr.remove(name.attribute("datatype"));
    		}
    		org_addr.setText(authororganizationaddr);
    	}
    	
    	
    	Element custodian_name = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:custodian/EMR:assignedCustodian/EMR:representedCustodianOrganization/EMR:name");
    	if(custodian_name != null){
    		custodian_name.setText(custodianname);
    	}
    	Element custodian_telecom = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:custodian/EMR:assignedCustodian/EMR:representedCustodianOrganization/EMR:telecom");
    	if(custodian_telecom != null){
    		custodian_telecom.addAttribute("value", custodiantelecom);
    	}
    	Element custodian_addr = (Element)mdl_doc.selectSingleNode("EMR:ClinicalDocument/EMR:custodian/EMR:assignedCustodian/EMR:representedCustodianOrganization/EMR:addr");
    	if(custodian_addr != null){
    		custodian_addr.setText(custodianaddr);
    	}
    }
    
}

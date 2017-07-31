package com.bsoft.ehr.util.eval;

import java.text.ParseException;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class EvalUtil {

	private static final Logger logger = LoggerFactory
			.getLogger(EvalUtil.class);
	
//	@SuppressWarnings("serial")
//	private static HashMap<String, String> map  = new HashMap<String, String>(){
//		
//		{
//			put("N17","N");
//			put("AN10","AN");
//			put("AN18","AN");
//			put("AN200","AN");
//		}
//		
//	};
	
	public static String tranToString(String type,String excelvalue,String service){
		
		if("".equals(excelvalue) || excelvalue == null){
			excelvalue = "-";
		}
		
		if("not-null".equals(type)){//��Ϊ��
			return excelvalue;
		}else if("T/F".equals(type)){
			if("sharedocs".equals(service)){//�����ĵ�
				if(!"true".equals(excelvalue) && !"false".equals(excelvalue) ){
					excelvalue = "true";
				}
			}else{
				if(!"T".equals(excelvalue) && !"F".equals(excelvalue) ){
					excelvalue = "T";
				}
			}
			
		}else if("D8".equals(type)){
			if(excelvalue.length() == 8){
				return excelvalue;
			}else{
				try {
					excelvalue.replace("T", " ");
					excelvalue = SimpleDateUtil.format(SimpleDateUtil.parse(excelvalue, SimpleDateUtil.DATE_FORMAT),"yyyyMMdd");
				} catch (ParseException e) {
					try {
						excelvalue = SimpleDateUtil.format(SimpleDateUtil.parse(excelvalue, "yyyy/MM/dd"),"yyyyMMdd");
					} catch (ParseException e1) {
						excelvalue = SimpleDateUtil.format(new Date(),"yyyyMMdd");
					}
				}
			}
		}else if("DT15".equals(type)){
			if(excelvalue.length() == 14){
				return excelvalue;
			}else{
				try {
					excelvalue.replace("T", " ");
					excelvalue = SimpleDateUtil.format(SimpleDateUtil.parse(excelvalue, SimpleDateUtil.DATETIME_FORMAT),"yyyyMMddHHmmss");
				} catch (ParseException e) {
					try {
						excelvalue = SimpleDateUtil.format(SimpleDateUtil.parse(excelvalue, "yyyy/MM/dd HH:mm:ss"),"yyyyMMddHHmmss");
					} catch (ParseException e1) {
						excelvalue = SimpleDateUtil.format(new Date(),"yyyyMMddHHmmss");
					}
				}
			}
		}else{
			
			String dot[] = type.split(",");
			if(dot.length>1){//��ֵ��
//				if("-".equals(excelvalue)){
//					excelvalue = "0";
//					return excelvalue;
//				}
				int num = Integer.parseInt(dot[1]);
				String point[] = dot[0].split("\\..");
				if(point.length>1){
					int len = 1;
					if(point[0].length()>1){
						len = Integer.parseInt(point[0].substring(1));
					}
					int max = Integer.parseInt(point[1]);
					excelvalue = getValue(excelvalue, len , "N", true,max ,num);
				}else{
					int max = Integer.parseInt(point[0].substring(1));
					excelvalue = getValue(excelvalue, 0 , "N", false, max ,num);
				}
			}else{
				String point[] = type.split("\\..");
				if(point.length>1){//��ֵ���ַ��� �� �ַ���
					String letter = point[0];
					int max =Integer.parseInt(point[1]);
					if(letter.length()==1){
						String l_n1 = letter.substring(0);
						if("N".equalsIgnoreCase(l_n1)){
							if("-".equals(excelvalue)){
								excelvalue = "0";
								return excelvalue;
							}
							excelvalue = getValue(excelvalue, 1 , "N",true,max,0);
						}else{
							if("-".equals(excelvalue)){
								return excelvalue;
							}
							excelvalue = getValue(excelvalue, 1 , "A",true,max,0);
						}
					}else{
						String l_n1 = letter.substring(1, letter.length());
						if(isNumeric(l_n1)){//�ж�����ֵ
							String l = letter.substring(0,1);
							int len = Integer.parseInt(letter.substring(1));
							if("A".equalsIgnoreCase(l)){//�ַ�
								if("-".equals(excelvalue)){
									return excelvalue;
								}
								excelvalue = getValue(excelvalue, len , "A",true,max,0);
							}else if("N".equalsIgnoreCase(l)){//��ֵ
//								if("-".equals(excelvalue)){
//									excelvalue = "0";
//									return excelvalue;
//								}
								excelvalue = getValue(excelvalue, len , "N",true,max,0);
							}
						}else{
							String l_n2 = l_n1.substring(1);
							if(isNumeric(l_n2)){
								if("-".equals(excelvalue)){
									excelvalue = "0";
									return excelvalue;
								}
								excelvalue = getValue(excelvalue, Integer.parseInt(l_n2) , "A",true,max,0);
							}
						}
					}
					
				}else{//, ��  .. ���˺�����
					String l_n1 = type.substring(1, type.length());
					if(isNumeric(l_n1)){//�ж�����ֵ
						String l = type.substring(0,1);
						int max = Integer.parseInt(type.substring(1));
						if("A".equalsIgnoreCase(l)){//�ַ�
							excelvalue = getValue(excelvalue, 0 , "A",false, max,0);
						}else if("N".equalsIgnoreCase(l)){//��ֵ
							if("-".equals(excelvalue)){
								excelvalue = "0";
							}
							excelvalue = getValue(excelvalue, 0 , "N",false, max,0);
						}
					}else{
						String l_n2 = l_n1.substring(1);
						if(isNumeric(l_n2)){
							if("-".equals(excelvalue)){
								excelvalue = "0";
							}
							excelvalue = getValue(excelvalue, 0 , "A",false, Integer.parseInt(l_n2),0);
						}
					}
				}
			}
			
		}
		
		return excelvalue;
	}
	
//	private static String getValue(String type,String excelvalue){
//		
//		String length = type.replace(map.get(type), "");
//		int len = Integer.parseInt(length);
//		
//		if("N".equals(map.get(type)) && !isNumeric(excelvalue)){//�ж����������int,��ֵ��������
//			excelvalue = addZero(len);
//		}else{
//			if(excelvalue.length() != len){//�жϳ��ȹ�����
//				if(excelvalue.length() > len){
//					excelvalue = excelvalue.substring(0,len);
//				}else{
//					excelvalue = excelvalue + addZero(len-excelvalue.length());
//				}
//			}
//		}
//		
//		return excelvalue;
//	}
	
	public static boolean isNumeric(String str)
    {
		if(str == null || "".equals(str)){
			return false;
		}
		Pattern pattern = Pattern.compile("[0-9]*");
		Matcher isNum = pattern.matcher(str);
		if( !isNum.matches() )
		{
			return false;
		}
		return true;
    }
	
	public static String addZero(int len){
		StringBuilder zeros = new StringBuilder(); 
		for(int i =0 ;i<len;i++){
			zeros.append("0");
		}
		return zeros.toString();
	}
	
	public static String getValue(String excelvalue,int len, String T, boolean b, int max ,int num){
		
		try{
			if(num>0){
				if(b){
					String[] value = excelvalue.split("\\.");
					if(value.length>1){ 
//						if(excelvalue.length()>=len && excelvalue.length()<=max){
							return excelvalue;
//						}
						
//						if(value[1].length() != num){
//							if(value[1].length() > num){
//								String rvalue = value[1].substring(0,num);
//								if(value[0].length() >= len && value[0].length()<=max){
//									excelvalue = value[0] + "." + rvalue;
//								}else{
//									if(value[0].length() > max){
//										excelvalue = value[0].substring(0,max) + "." + rvalue;
//									}else{
//										excelvalue =value[0] + addZero(len-value[0].length()) + "." + rvalue;
//									}
//								}
//							}else{
//								String rvalue = value[1] + addZero(num-value[1].length());
//								if(value[0].length() >= len && value[0].length()<=max){
//									excelvalue = value[0] + "." + rvalue;
//								}else{
//									if(value[0].length() > max){
//										excelvalue = value[0].substring(0,max) + "." + rvalue;
//									}else{
//										excelvalue = value[0] + addZero(len-value[0].length()) + "." + rvalue;
//									}
//								}
//							}
//						}
					}else{
						
						if(isNumeric(excelvalue)){
							if(excelvalue.length() >= len && excelvalue.length()<=max){
								return excelvalue;
							}else{
								if(excelvalue.length() > max){
									excelvalue = excelvalue.substring(0,len) + "." + RandomUtil.genRandomStr(num);
								}else{
									excelvalue = excelvalue+ "." + RandomUtil.genRandomStr(num);
								}
							}
						}else{
							if(len>2){
								excelvalue = RandomUtil.genRandomStr(len-1-num)+"."+RandomUtil.genRandomStr(num);
							}else{
								excelvalue = RandomUtil.genRandomStr(1)+"."+RandomUtil.genRandomStr(num);
							}
							
						}
						
						
					}
					return excelvalue;
				}else{
					String[] value = excelvalue.split("\\.");
					if(value.length>1){
						return excelvalue;
	//					if(value[1].length() != num){//�жϳ��ȹ�����
	//						if(value[1].length() > num){
	//							String rvalue = value[1].substring(0,num);
	//							if(value[0].length() >max){
	//								excelvalue = value[0].substring(0,max) + "." + rvalue;
	//							}else{
	//								excelvalue = value[0] + addZero(max-value[0].length()) + "." + rvalue;
	//							}
	//						}else{
	//							String rvalue = value[1] + addZero(num-value[1].length());
	//							if(value[0].length() >max){
	//								excelvalue = value[0].substring(0,max) + "." + rvalue;
	//							}else{
	//								excelvalue = value[0] + addZero(max-value[0].length()) + "." + rvalue;
	//							}
	//						}
	//					}
					}else{
//						if(excelvalue.length() >max){
//							excelvalue = excelvalue.substring(0,max-1-num) + "." + RandomUtil.genRandomStr(num);
//						}else{
							excelvalue = RandomUtil.genRandomStr(max-1-num)+ "." + RandomUtil.genRandomStr(num);
//						}
					}
				}
			}else if("N".equals(T) && !isNumeric(excelvalue)){
				if(b){
					return RandomUtil.genRandomStr(len);
				}
				excelvalue = RandomUtil.genRandomStr(max);
			}else{
				if(b){
					if(excelvalue.length() >= len && excelvalue.length()<= max){
						return excelvalue;
					}else{
						if(excelvalue.length() > max){
							excelvalue = excelvalue.substring(0,max);
						}else{
							excelvalue = excelvalue+ RandomUtil.genRandomStr(len-excelvalue.length());
						}
					}
				}
				if(excelvalue.length() != max){//�жϳ��ȹ�����
//					if(excelvalue.length() > max){
//						excelvalue = excelvalue.substring(0,max);
//					}else{
						excelvalue = RandomUtil.genRandomStr(max);
//					}
				}
			}
		}catch (Exception e) {
			logger.error(" get value :" + e);
			e.printStackTrace();
		}
		
		return excelvalue;
	}
	
	
	public static void main(String[] args) throws ParseException {
		System.out.println(SimpleDateUtil.parse("2015-11-19", SimpleDateUtil.DATE_FORMAT));
//		System.out.println(tranToString("D8", "2015-11-19", ""));
//		System.out.println(tranToString("N5,2", "", ""));
//		System.out.println(tranToString("N4,1", "", ""));
//		System.out.println(tranToString("N..6,2", "", ""));
//		System.out.println(tranToString("N17", "", ""));
//		System.out.println(tranToString("AN1..70", "",""));
	}
}

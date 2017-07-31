package com.bsoft.ehr.redis;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
public class TestSerializerTranscoder implements Serializable {
  
  private static final long serialVersionUID = -1941046831377985500L;

  public TestSerializerTranscoder() {
    
  }

//  public void testObject() {
//    List<TestUser> lists = buildTestData();
//    
//    TestUser userA = lists.get(0);
//    
//    ObjectsTranscoder<TestUser> objTranscoder =  new ObjectsTranscoder<>();
//    
//    byte[] result1 = objTranscoder.serialize(userA);
//    
//    TestUser userA_userA = objTranscoder.deserialize(result1);
//    
//    System.out.println(userA_userA.getName() + "\t" + userA_userA.getAge());
//  }
  
  public static void testList() {
	  List<Map<String, Object>> lists = buildTestData();
    

    ListTranscoder<HashMap<String, Object>> listTranscoder = new ListTranscoder<HashMap<String, Object>>();
    
    byte[] result1 = listTranscoder.serialize(lists);
    
    List<HashMap<String, Object>> results = listTranscoder.deserialize(result1);
  
    for (Map<String, Object> user : results) {
    	for (String key : user.keySet()) {
    		   System.out.println("key= "+ key + " and value= " + user.get(key));
    		  }
    }
  }
  
  private static List<Map<String, Object>> buildTestData() {
  	List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("a", "a");
    map.put("b", "b");
    map.put("c", "c");
    list.add(map);
     return list;  
   }
  
  
  public static void main(String[] args) {
	  testList();
  }
}
package com.bsoft.ehr.redis.dao;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.serializer.RedisSerializer;

import com.bsoft.ehr.redis.ListTranscoder;

public  class RedisInitDao extends AbstractBaseRedisDao<String, Object> {
		
	 protected static Logger logger = Logger.getLogger(RedisInitDao.class);
	
	 	/**
	 	 * @param list
	 	 * @param tableName
	 	 * @return
	 	 */
		public boolean addList(final List<Map<String, Object>> list,final String pkey) {
			boolean result = redisTemplate.execute(new RedisCallback<Boolean>() {
				public Boolean doInRedis(RedisConnection connection)
						throws DataAccessException {
					RedisSerializer<String> serializer = redisTemplate.getStringSerializer();
					ListTranscoder<Map<String, Object>> listTranscoder = new ListTranscoder<Map<String, Object>>();
					byte[] key  = serializer.serialize(pkey);
					byte[] value = listTranscoder.serialize(list);
					connection.setNX(key, value);
					return true;
				}
			}, false, true);
			return result;
		}
		
		/**
		 * 
		 * @param pkey
		 * @return
		 */
		public List<Map<String, Object>> getListFromRedis(final String pkey) {
			
			ListTranscoder<Map<String, Object>> listTranscoder = new ListTranscoder<Map<String, Object>>();
			List<Map<String, Object>> records = listTranscoder.deserialize(redisTemplate.execute((new RedisCallback<byte[]>() {
				@Override
				public byte[] doInRedis(RedisConnection conn)
						throws DataAccessException {
					byte[] key = redisTemplate.getStringSerializer().serialize(pkey);
					if (conn.exists(key)) {  
						return conn.get(key);
					}
					return null;
				}
			})));
			return records;
		}
}
	
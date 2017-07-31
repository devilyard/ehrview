package com.bsoft.ehr.redis.dao;

import org.springframework.data.redis.core.StringRedisTemplate;
public abstract class AbstractBaseRedisDao<K, V> {  
      
    protected StringRedisTemplate redisTemplate;  
  
    public void setRedisTemplate(StringRedisTemplate redisTemplate) {  
        this.redisTemplate = redisTemplate;  
    }  
} 
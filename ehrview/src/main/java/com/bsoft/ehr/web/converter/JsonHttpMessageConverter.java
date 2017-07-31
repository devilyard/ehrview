/*
 * @(#)JsonHttpMessageConverter.java Created on 2012-11-28 下午10:16:27
 * 
 * 版权：版权所有 Shi 保留所有权力。
 */
package com.bsoft.ehr.web.converter;

import java.io.IOException;
import java.text.SimpleDateFormat;

import org.codehaus.jackson.JsonEncoding;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.SerializationConfig;
import org.codehaus.jackson.map.SerializationConfig.Feature;
import org.codehaus.jackson.map.annotate.JsonSerialize.Inclusion;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.http.converter.json.MappingJacksonHttpMessageConverter;

/**
 * 
 * @author <a href="mailto:rishyonn@gmail.com">zhengshi</a>
 */
public class JsonHttpMessageConverter extends
		MappingJacksonHttpMessageConverter {

	private boolean prefixJson = false;

	public JsonHttpMessageConverter() {
		super();
		ObjectMapper objectMapper = getObjectMapper();
		SerializationConfig sconfig = objectMapper.getSerializationConfig();
		sconfig.set(Feature.WRITE_DATES_AS_TIMESTAMPS, false);
		sconfig.setSerializationInclusion(Inclusion.NON_NULL);
		objectMapper.getSerializationConfig().setDateFormat(
				new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
	}

	public void setPrefixJson(boolean prefixJson) {
		this.prefixJson = prefixJson;
		super.setPrefixJson(prefixJson);
	}
	
	@Override
	protected void writeInternal(Object object, HttpOutputMessage outputMessage)
			throws IOException, HttpMessageNotWritableException {
		JsonEncoding encoding = getJsonEncoding(outputMessage.getHeaders()
				.getContentType());
		JsonGenerator jsonGenerator = getObjectMapper().getJsonFactory()
				.createJsonGenerator(outputMessage.getBody(), encoding);
		try {
			if (this.prefixJson) {
				jsonGenerator.writeRaw("{} && ");
			}
			getObjectMapper().writeValue(jsonGenerator, object);
		} catch (JsonProcessingException ex) {
			throw new HttpMessageNotWritableException("Could not write JSON: "
					+ ex.getMessage(), ex);
		}
	}

}

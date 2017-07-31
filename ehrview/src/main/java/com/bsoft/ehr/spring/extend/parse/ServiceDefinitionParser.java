/*
 * @(#)ServiceBeanDefinitionParser.java Created on 2013年11月14日 下午2:59:01
 * 
 * 版权：版权所有 Bsoft 保留所有权力。
 */
package com.bsoft.ehr.spring.extend.parse;

import java.util.List;

import org.springframework.beans.MutablePropertyValues;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.RuntimeBeanReference;
import org.springframework.beans.factory.config.TypedStringValue;
import org.springframework.beans.factory.support.ChildBeanDefinition;
import org.springframework.beans.factory.support.ManagedList;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.beans.factory.xml.BeanDefinitionParser;
import org.springframework.beans.factory.xml.ParserContext;
import org.springframework.util.ClassUtils;
import org.springframework.util.StringUtils;
import org.springframework.util.xml.DomUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.bsoft.ehr.spring.extend.EHRServiceBean;

import ctd.spring.AppDomainContext;

/**
 * 
 * 
 * @author <a href="mailto:zhengs@bsoft.com.cn">zhengshi</a>
 */
public class ServiceDefinitionParser implements BeanDefinitionParser {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.beans.factory.xml.BeanDefinitionParser#parse(org.
	 * w3c.dom.Element, org.springframework.beans.factory.xml.ParserContext)
	 */
	@Override
	public BeanDefinition parse(Element el, ParserContext context) {
		RootBeanDefinition def = new RootBeanDefinition();
		def.setBeanClass(EHRServiceBean.class);
		def.setInitMethodName("deploy");

		String id = el.getAttribute("id");
		String ref = el.getAttribute("ref");
		String clz = el.getAttribute("class");
		String weights = el.getAttribute("weights");
		String subscribe = el.getAttribute("subscribe");
		String mockClass = el.getAttribute("mockClass");

		RuntimeBeanReference reference = null;
		MutablePropertyValues pv = def.getPropertyValues();

		if (org.apache.commons.lang3.StringUtils.isEmpty(id)) {
			if (org.apache.commons.lang3.StringUtils.isEmpty(ref)) {
				throw new IllegalStateException(
						"service @id not defeined,@ref must not be null");
			}
			id = ref;
			reference = new RuntimeBeanReference(ref);
		} else {
			if (org.apache.commons.lang3.StringUtils.isEmpty(clz)) {
				if (org.apache.commons.lang3.StringUtils.isEmpty(ref)) {
					throw new IllegalStateException("service[" + id
							+ "] @ref not defeined,@class must not be null");
				} else {
					reference = new RuntimeBeanReference(ref);
				}
			} else {
				reference = registryBean(el, context);
			}
		}

		String domain = AppDomainContext.getName();
		String beanName = domain + "." + id;
		context.getRegistry().registerBeanDefinition(beanName, def);
		pv.add("id", beanName);
		pv.add("appDomain", domain);
		if (org.apache.commons.lang3.StringUtils.isNotEmpty(weights)) {
			pv.add("weights", weights);
		}
		if (org.apache.commons.lang3.StringUtils.isNotEmpty(subscribe)) {
			pv.add("subscribe", subscribe);
		}
		if (org.apache.commons.lang3.StringUtils.isNotEmpty(mockClass)) {
			pv.add("mockClass", mockClass);
		}
		pv.add("ref", reference);
		return def;
	}

	/**
	 * @param element
	 * @param parserContext
	 * @return
	 */
	private RuntimeBeanReference registryBean(Element element,
			ParserContext parserContext) {
		String id = element.getAttribute("id");
		String className = element.getAttribute("class");
		BeanDefinition def = null;
		if (element.hasAttribute("parent")) {
			def = new ChildBeanDefinition(element.getAttribute("parent"));
			if (element.hasAttribute("abstract")) {
				((RootBeanDefinition) def).setAbstract(Boolean
						.parseBoolean(element.getAttribute("abstract")));
			}
		} else {
			def = new RootBeanDefinition();
		}
		def.setBeanClassName(className);
		parserContext.getRegistry().registerBeanDefinition(id, def);
		RuntimeBeanReference reference = new RuntimeBeanReference(id);

		NodeList nodeList = element.getChildNodes();
		if (nodeList == null || nodeList.getLength() == 0) {
			return reference;
		}
		for (int i = 0; i < nodeList.getLength(); i++) {
			Node node = nodeList.item(i);
			if (!(node instanceof Element)
					|| !node.getLocalName().equals("property")) {
				continue;
			}
			Element p = (Element) node;
			String name = p.getAttribute("name");
			if (def.getPropertyValues().contains(name)) {
				throw new IllegalStateException(
						"Multiple 'property' definitions for property '" + name
								+ "'");
			}
			Object value = parsePropertyElement(p, parserContext);
			PropertyValue pv = new PropertyValue(name, value);
			pv.setSource(parserContext.extractSource(p));
			def.getPropertyValues().addPropertyValue(pv);
		}
		return reference;
	}

	/**
	 * @param p
	 * @param parserContext
	 * @return
	 */
	private Object parsePropertyElement(Element p, ParserContext parserContext) {
		boolean hasRefAttribute = p.hasAttribute("ref");
		boolean hasValueAttribute = p.hasAttribute("value");
		if ((hasRefAttribute && hasValueAttribute)
				|| ((hasRefAttribute || hasValueAttribute) && p.getChildNodes()
						.getLength() != 0)) {
			throw new IllegalStateException(
					" is only allowed to contain either 'ref' attribute OR 'value' attribute OR sub-element");
		}
		if (p.hasAttribute("value")) {
			String value = p.getAttribute("value");
			return value;
		} else if (p.hasAttribute("ref")) {
			String ref = p.getAttribute("ref");
			RuntimeBeanReference bf = new RuntimeBeanReference(ref);
			bf.setSource(parserContext.extractSource(p));
			return bf;
		} else if (p.hasChildNodes()) {
			return parsePropertySubElement(p, parserContext);

		}
		throw new IllegalStateException("Illegal property setting of: "
				+ p.getAttribute("name"));
	}

	/**
	 * @param p
	 * @param parserContext
	 * @return
	 */
	private Object parsePropertySubElement(Element p,
			ParserContext parserContext) {
		NodeList nodes = p.getChildNodes();
		if (nodes == null || nodes.getLength() == 0) {
			throw new IllegalStateException("Property must has one value.");
		}
		Element subNode = null;
		for (int i = 0; i < nodes.getLength(); i++) {
			if (nodes.item(i) instanceof Element) {
				subNode = (Element) nodes.item(i);
				if (subNode.getLocalName().equals("list")) {
					return parseListProperty(subNode, parserContext);
				} /*
				 * else if (subNode.getLocalName().equals("map")) { return
				 * parseMapProperty(subNode, parserContext); }
				 */
			}
		}
		throw new IllegalStateException("Property " + p.getAttribute("name")
				+ " must has a value.");
	}

	/**
	 * @param element
	 * @param registry
	 * @return
	 */
	private List<Object> parseListProperty(Element listEle,
			ParserContext parserContext) {
		List<Element> listEntry = DomUtils.getChildElements(listEle);
		if (listEntry == null || listEntry.isEmpty()) {
			throw new IllegalStateException(
					"Property of list type must has at least one child element named \"value\" or \"ref\".");
		}

		String defaultElementType = listEle.getAttribute("value-type");
		ManagedList<Object> entries = new ManagedList<Object>(listEntry.size());
		entries.setSource(parserContext.extractSource(listEle));
		entries.setElementTypeName(defaultElementType);
		String merge = listEle.getAttribute("merge");
		if (merge != null) {
			entries.setMergeEnabled(Boolean.valueOf(merge));
		}
		for (Element node : listEntry) {
			if (node.getLocalName().equals("ref")) {
				String bean = node.getAttribute("bean");
				RuntimeBeanReference bf = new RuntimeBeanReference(bean);
				bf.setSource(parserContext.extractSource(node));
				entries.add(bf);
			} else if (node.getLocalName().equals("value")) {
				String value = node.getAttribute("value");
				entries.add(value);
			}
		}
		return entries;
	}

	// /**
	// * @param mapEle
	// * @param parserContext
	// * @return
	// */
	// private Map<Object, Object> parseMapProperty(Element mapEle,
	// ParserContext parserContext) {
	// List<Element> entryEles = DomUtils.getChildElementsByTagName(mapEle,
	// "entry");
	// if (entryEles == null || entryEles.isEmpty()) {
	// throw new IllegalStateException(
	// "Property of map type must has at least one child element named \"entry\".");
	// }
	//
	// String defaultKeyType = mapEle.getAttribute("key-type");
	// String defaultValueType = mapEle.getAttribute("value-type");
	//
	// ManagedMap<Object, Object> map = new ManagedMap<Object, Object>(
	// entryEles.size());
	// map.setSource(parserContext.extractSource(mapEle));
	// map.setKeyTypeName(defaultKeyType);
	// map.setValueTypeName(defaultValueType);
	//
	// for (Element entryEle : entryEles) {
	// NodeList entrySubNodes = entryEle.getChildNodes();
	// Element keyEle = null;
	// Element valueEle = null;
	// for (int j = 0; j < entrySubNodes.getLength(); j++) {
	// Node node = entrySubNodes.item(j);
	// if (node instanceof Element) {
	// Element candidateEle = (Element) node;
	// if (nodeNameEquals(candidateEle, "key")) {
	// if (keyEle != null) {
	// throw new IllegalStateException(
	// "<entry> element is only allowed to contain one <key> sub-element");
	// } else {
	// keyEle = candidateEle;
	// }
	// } else {
	// if (valueEle != null) {
	// throw new IllegalStateException(
	// "<entry> element must not contain more than one value sub-element");
	// } else {
	// valueEle = candidateEle;
	// }
	// }
	// }
	// }
	//
	// Object key = null;
	// boolean hasKeyAttribute = entryEle.hasAttribute("key");
	// boolean hasKeyRefAttribute = entryEle.hasAttribute("key-ref");
	// if ((hasKeyAttribute && hasKeyRefAttribute)
	// || ((hasKeyAttribute || hasKeyRefAttribute))
	// && keyEle != null) {
	// throw new IllegalStateException(
	// "<entry> element is only allowed to contain either "
	// + "a 'key' attribute OR a 'key-ref' attribute OR a <key> sub-element");
	// }
	// if (hasKeyAttribute) {
	// key = buildTypedStringValueForMap(entryEle.getAttribute("key"),
	// defaultKeyType, entryEle, parserContext);
	// } else if (hasKeyRefAttribute) {
	// String refName = entryEle.getAttribute("key-ref");
	// if (!StringUtils.hasText(refName)) {
	// throw new IllegalStateException(
	// "<entry> element contains empty 'key-ref' attribute");
	// }
	// RuntimeBeanReference ref = new RuntimeBeanReference(refName);
	// ref.setSource(parserContext.extractSource(entryEle));
	// key = ref;
	// } else if (keyEle != null) {
	// key = parseKeyElement(keyEle, bd, defaultKeyType);
	// } else {
	// throw new IllegalStateException(
	// "<entry> element must specify a key");
	// }
	//
	// // Extract value from attribute or sub-element.
	// Object value = null;
	// boolean hasValueAttribute = entryEle.hasAttribute("vlaue");
	// boolean hasValueRefAttribute = entryEle.hasAttribute("value-ref");
	// boolean hasValueTypeAttribute = entryEle.hasAttribute("value-type");
	// if ((hasValueAttribute && hasValueRefAttribute)
	// || ((hasValueAttribute || hasValueRefAttribute))
	// && valueEle != null) {
	// throw new IllegalStateException(
	// "<entry> element is only allowed to contain either "
	// + "'value' attribute OR 'value-ref' attribute OR <value> sub-element");
	// }
	// if ((hasValueTypeAttribute && hasValueRefAttribute)
	// || (hasValueTypeAttribute && !hasValueAttribute)
	// || (hasValueTypeAttribute && valueEle != null)) {
	// throw new IllegalStateException(
	// "<entry> element is only allowed to contain a 'value-type' "
	// + "attribute when it has a 'value' attribute");
	// }
	// if (hasValueAttribute) {
	// String valueType = entryEle.getAttribute("value-type");
	// if (!StringUtils.hasText(valueType)) {
	// valueType = defaultValueType;
	// }
	// value = buildTypedStringValueForMap(
	// entryEle.getAttribute("value"), valueType, entryEle,
	// parserContext);
	// } else if (hasValueRefAttribute) {
	// String refName = entryEle.getAttribute("value-ref");
	// if (!StringUtils.hasText(refName)) {
	// throw new IllegalStateException(
	// "<entry> element contains empty 'value-ref' attribute");
	// }
	// RuntimeBeanReference ref = new RuntimeBeanReference(refName);
	// ref.setSource(parserContext.extractSource(entryEle));
	// value = ref;
	// } else if (valueEle != null) {
	// value = parsePropertySubElement(valueEle, bd, defaultValueType);
	// } else {
	// throw new IllegalStateException(
	// "<entry> element must specify a value");
	// }
	//
	// // Add final key and value to the Map.
	// map.put(key, value);
	// }
	//
	// return map;
	// }

	protected final Object buildTypedStringValueForMap(String value,
			String defaultTypeName, Element entryEle,
			ParserContext parserContext) {
		try {
			TypedStringValue typedValue = buildTypedStringValue(value,
					defaultTypeName, parserContext);
			typedValue.setSource(parserContext.extractSource(entryEle));
			return typedValue;
		} catch (ClassNotFoundException ex) {
			throw new IllegalStateException("Type class [" + defaultTypeName
					+ "] not found for Map key/value type");
		}
	}

	protected TypedStringValue buildTypedStringValue(String value,
			String targetTypeName, ParserContext parserContext)
			throws ClassNotFoundException {
		ClassLoader classLoader = parserContext.getReaderContext()
				.getBeanClassLoader();
		TypedStringValue typedValue;
		if (!StringUtils.hasText(targetTypeName)) {
			typedValue = new TypedStringValue(value);
		} else if (classLoader != null) {
			Class<?> targetType = ClassUtils.forName(targetTypeName,
					classLoader);
			typedValue = new TypedStringValue(value, targetType);
		} else {
			typedValue = new TypedStringValue(value, targetTypeName);
		}
		return typedValue;
	}

	public boolean nodeNameEquals(Node node, String desiredName) {
		return desiredName.equals(node.getNodeName())
				|| desiredName.equals(getLocalName(node));
	}

	public String getLocalName(Node node) {
		return node.getLocalName();
	}
}

package ctd.config;

import ctd.config.support.ConfigWatcher;
import ctd.domain.DomainBean;
import ctd.net.rpc.Client;
import ctd.util.DomainUtil;
import ctd.util.FileFinder;
import ctd.util.xml.XMLHelper;
import java.io.File;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.commons.lang3.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MultiConfigController extends SingleConfigController
{
  private static final long serialVersionUID = 7328088355704495784L;
  private static final Logger LOGGER = LoggerFactory.getLogger(MultiConfigController.class);
  protected String suffix = ".xml";
  private Map<String, Long> filesVersion = new ConcurrentHashMap<String, Long>();

  public Document getConfigDoc(String id) {
    Document doc = null;
    String filename = getConfigFilename(id);
    if (!StringUtils.isEmpty(filename)) {
      File file = new File(filename);
      if (file.exists()) {
        doc = XMLHelper.getDocument(file);
        if (doc != null) {
          Element root = doc.getRootElement();
          root.addAttribute("id", DomainUtil.getId(id));
          root.addAttribute("version", String.valueOf(file.lastModified()));
        }
      }
    }
    if ((!DomainUtil.isConfigDomain()) && 
      (doc == null)) {
      try {
        doc = (Document)Client.rpcInvoke("configuration.configLoader", "getConfigDoc", new Object[] { getClass(), DomainUtil.getIdWithDomain(id) });
        if (doc != null)
        {
          Document ndoc = DocumentHelper.parseText(doc.asXML());
          doc = ndoc;
          LOGGER.info("get doc [{}] from remote.", id);
        }
      } catch (Exception e) {
        LOGGER.error("get doc [{}] from remote failed.", id, e);
      }
    }

    return doc;
  }

  private void updateVersion(File file, String domain) {
    File[] files = file.listFiles();
    for (File f : files)
      if (f.isDirectory()) {
        updateVersion(f, domain);
      } else {
        String fpath = f.getAbsolutePath();
        long fver = f.lastModified();
        if (!f.getName().equals(new File(this.ctrlFilename).getName()))
        {
          if (!this.filesVersion.containsKey(fpath)) {
            this.filesVersion.put(fpath, Long.valueOf(fver));
          } else {
            String id = getIdFromFilename(f.getName());
            if (id != null)
            {
              if (fver > ((Long)this.filesVersion.get(fpath)).longValue()) {
                this.filesVersion.put(fpath, Long.valueOf(fver));
                if (DomainUtil.isConfigDomain(domain)) {
                  reload(id);
                }
                ConfigWatcher.sendConfigMessage(Integer.valueOf(0), this.calalog, DomainUtil.getIdWithDomain(id, domain));

                LOGGER.info(fpath + " update version for file modified.");
              }
            }
          }
        }
      }
  }

  private String getIdFromFilename(String name) { if (name.endsWith(this.suffix)) {
      return name.substring(0, name.length() - this.suffix.length());
    }
    return null; }

  void syncConfigDoc()
  {
    if (StringUtils.isEmpty(this.homePath)) {
      return;
    }
    Map<String, DomainBean> ds = DomainUtil.getAllDomains();
    for (String domain : ds.keySet()) {
      String hPath = this.homePath;
      if (!DomainUtil.isConfigDomain(domain)) {
        hPath = this.homePath.replaceFirst("WEB-INF[/,\\\\]+config", "WEB-INF/" + domain);
      }
      File file = new File(hPath);
      if (file.exists())
      {
        updateVersion(file, domain);
      }
    }
  }

  public String getConfigFilename(String id)
  {
    if (StringUtils.isEmpty(this.homePath)) {
      return null;
    }
    String configDomain = DomainUtil.getDomainById(id);
    String configId = DomainUtil.getId(id);
    if (DomainUtil.isCurrentDomain(configDomain)) {
      if ((configId.contains(".")) || (configId.contains("/"))) {
        String nConfigId = configId.replace(".", "/");
        int in = nConfigId.lastIndexOf("/");
        return getConfigFilename(nConfigId.substring(in + 1), nConfigId.substring(0, in));
      }
      if (this.defineDoc != null) {
        Element root = this.defineDoc.getRootElement();
        Element el = (Element)root.selectSingleNode("*[@id='" + configId + "']");
        if (el != null) {
          return this.homePath + File.separatorChar + el.attributeValue("file", new StringBuilder().append(configId).append(this.suffix).toString());
        }
      }
      File file = FileFinder.searchSingleFile(new File(this.homePath), configId + this.suffix);
      if (file != null) {
        return file.getAbsolutePath();
      }
    }
    else if (DomainUtil.isConfigDomain()) {
      File file = FileFinder.searchSingleFile(new File(this.homePath.replaceFirst("WEB-INF[/,\\\\]+config", "WEB-INF/" + configDomain)), configId + this.suffix);
      if (file != null) {
        return file.getAbsolutePath();
      }
    }

    return null;
  }

  public String getConfigFilename(String id, String folder)
  {
    if (this.defineDoc == null) {
      return null;
    }
    if (!StringUtils.isEmpty(folder))
      folder = folder + File.separator;
    else {
      folder = "";
    }
    String filename = this.homePath + File.separator + folder + id + this.suffix;
    return filename;
  }

  public String getConfigFilename(String id, String folder, String domain) {
    if (this.defineDoc == null) {
      return null;
    }
    if (!StringUtils.isEmpty(folder))
      folder = folder + File.separator;
    else {
      folder = "";
    }
    String filename = this.homePath + File.separator + folder + id + this.suffix;
    if (!DomainUtil.isConfigDomain(domain)) {
      filename = this.homePath.replaceFirst("WEB-INF[/,\\\\]+config", new StringBuilder().append("WEB-INF/").append(domain).toString()) + File.separator + folder + id + this.suffix;
    }
    return filename;
  }

  public File saveConfigFile(String id) {
    if (!this.cache.containsKey(id)) {
      return null;
    }
    String fn = getConfigFilename(id);
    if (fn == null) {
      return null;
    }
    DocConfig cfg = (DocConfig)this.cache.get(id);
    Document doc = cfg.getDefineDoc();
    File file = new File(fn);
    XMLHelper.putDocument(file, doc);
    return file;
  }

  public File saveConfigFile(String id, long lastModified) {
    File file = saveConfigFile(id);
    if (file == null) {
      return null;
    }
    file.setLastModified(lastModified);
    return file;
  }

  public void run() {
    while (true) {
      syncCtrlDoc();
      syncConfigDoc();
      try {
        Thread.sleep(this.updateDelay);
      }
      catch (InterruptedException e) {
        LOGGER.error("config update thread sleep falied:{}", e.getMessage());
      }
    }
  }

  public void setDefineDoc(Document doc)
  {
    this.defineDoc = doc;
  }
}
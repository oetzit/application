package giovannimoretti.it.oetzi_words;

import com.google.gson.JsonObject;
import giovannimoretti.it.oetzi_words.sqlToolkit.SQL_Worker;

import org.apache.commons.io.FileUtils;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.*;

import java.nio.file.Paths;

import java.util.List;
import java.util.Properties;
import java.util.Set;

@WebListener
public class Listener implements ServletContextListener, HttpSessionListener, HttpSessionAttributeListener {

    public Listener() {
    }

    @Override
    public void contextInitialized(ServletContextEvent sce) {

        System.out.println("Context initialization");

        ServletContext context = sce.getServletContext();
        String WEBINF_fullPath = context.getRealPath("/WEB-INF");
        File property_file = Paths.get(WEBINF_fullPath, "config.prop").toFile();

        if (!property_file.exists()) {
            // if not exists generate new default prop file in WEB-INF folder of the webapp

            System.out.println("=============================================================");
            System.out.println("=                  Probably the first run                   =");
            System.out.println("=      Please, edit config prop file and restart server     =");
            System.out.println("=============================================================");


            try {
                OutputStream output = new FileOutputStream(property_file);
                Properties prop = new Properties();

                // set the properties value
                prop.setProperty("db.url", "localhost");
                prop.setProperty("db.user", "user");
                prop.setProperty("db.password", "password");
                prop.setProperty("file.imageFolder", "imageFolderPath");

                prop.store(output, null);

                System.out.println(prop);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Use saved config file");

            try (InputStream input = new FileInputStream(property_file)) {

                Properties prop = new Properties();
                // load the properties file
                prop.load(input);

                JsonObject configuration = new JsonObject();

                configuration.addProperty("dbHost", prop.getProperty("db.url"));
                configuration.addProperty("dbUser", prop.getProperty("db.user"));
                configuration.addProperty("dbPassword", prop.getProperty("db.password"));
                configuration.addProperty("imageFolder", prop.getProperty("file.imageFolder"));

                sce.getServletContext().setAttribute("config", configuration);

            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
        JsonObject config = (JsonObject) sce.getServletContext().getAttribute("config");

         //sync image folder with db
        SQL_Worker sqlw = new SQL_Worker(config.get("dbHost").getAsString(),config.get("dbUser").getAsString(),config.get("dbPassword").getAsString());
        Set<String> imageMD5Pair = sqlw.getImageMD5Pair();


        File dir = new File(config.get("imageFolder").getAsString());
        List<File> fileList = (List<File>) FileUtils.listFiles(dir, new String[]{"png",}, false);
        for (File f : fileList) {
            try {
               InputStream input = new FileInputStream(f) ;
               String md5 = org.apache.commons.codec.digest.DigestUtils.md5Hex(input);

                if (!imageMD5Pair.contains(f.getName()+"_"+md5)){
                    // not optimized
                    sqlw.insertSingleImage(f.getName(),md5,f);
                }
            }catch (Exception e){
                e.printStackTrace();
            }
        }






    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {

    }
//
//    @Override
//    public void sessionCreated(HttpSessionEvent se) {
//        /* Session is created. */
//    }
//
//    @Override
//    public void sessionDestroyed(HttpSessionEvent se) {
//        /* Session is destroyed. */
//    }
//
//    @Override
//    public void attributeAdded(HttpSessionBindingEvent sbe) {
//        /* This method is called when an attribute is added to a session. */
//    }
//
//    @Override
//    public void attributeRemoved(HttpSessionBindingEvent sbe) {
//        /* This method is called when an attribute is removed from a session. */
//    }
//
//    @Override
//    public void attributeReplaced(HttpSessionBindingEvent sbe) {
//        /* This method is called when an attribute is replaced in a session. */
//    }
}

package giovannimoretti.it.oetzi_words.utils;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;

public class SupportFunctions {
    public static JsonObject getRequestParameters(HttpServletRequest request){
        JsonObject params = new JsonObject();
        StringBuffer jb = new StringBuffer();
        String line = null;
        try {
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null) {
                jb.append(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        params = new JsonParser().parse(jb.toString()).getAsJsonObject();

        return params;
    }

}

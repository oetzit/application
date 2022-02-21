package giovannimoretti.it.oetzi_words.servlets;

import com.google.gson.JsonObject;
import giovannimoretti.it.oetzi_words.sqlToolkit.SQL_Worker;
import giovannimoretti.it.oetzi_words.utils.SupportFunctions;
import org.apache.commons.text.similarity.LevenshteinDistance;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet(name = "CheckTranscription", value = "/CheckTranscription")
public class CheckTranscription extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletContext context = request.getSession().getServletContext();
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // important this can be inserts in the config file
        Integer maxStoreForTranslation = 50;


        JsonObject result = new JsonObject();

        JsonObject requestParameters = SupportFunctions.getRequestParameters(request);
        Integer imageID = requestParameters.get("refData").getAsJsonObject().get("id").getAsInt();
        String transcription = requestParameters.get("transcription").getAsString();
        Integer gameTime = requestParameters.get("deltaTime").getAsInt();

        Boolean hit = false;
        if (transcription.trim().length() > 0 ) {
            try {

                SQL_Worker sql_worker = new SQL_Worker((JsonObject) context.getAttribute("config"));
                List<String> availableTranscriptions = sql_worker.getStoredTranscriptionOfImage(imageID);
                boolean insertAnyway = availableTranscriptions.size() < maxStoreForTranslation;
                LevenshteinDistance ld = new LevenshteinDistance();
                for (String trans : availableTranscriptions) {
                    if (ld.apply(trans, transcription) < 2) {
                        hit = true;
                    }
                }

                if (insertAnyway) {
                    sql_worker.insertTranscription(imageID, transcription, gameTime);
                }


            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        result.addProperty("hitTheTarget", hit);

        out.write(result.toString());


    }
}

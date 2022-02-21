package giovannimoretti.it.oetzi_words.servlets;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import giovannimoretti.it.oetzi_words.sqlToolkit.SQL_Worker;
import giovannimoretti.it.oetzi_words.utils.SupportFunctions;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;

@WebServlet(name = "GetImage", value = "/GetImage")
public class GetImage extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletContext context = request.getSession().getServletContext();
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        JsonObject output = new JsonObject();

        JsonObject requestParameters = SupportFunctions.getRequestParameters(request);

        Gson gson = new Gson();
        JsonArray imagesarray = requestParameters.get("sessionImages").getAsJsonArray();
        Set<Integer> sessionImages = new HashSet<>();
        for (int i = 0; i < imagesarray.size(); i++) {
            sessionImages.add(imagesarray.get(i).getAsInt());
        }


        try {
            SQL_Worker sql_worker = new SQL_Worker((JsonObject) context.getAttribute("config"));
            output = sql_worker.lessTranscriptedImage(sessionImages);


        } catch (SQLException e) {
            e.printStackTrace();
        }
//        System.out.println(idImage);

        out.write(output.toString());
//        System.out.println(request.getParameter("sessionImages"));
    }
}

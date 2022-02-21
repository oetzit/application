package giovannimoretti.it.oetzi_words.sqlToolkit;

import com.google.common.base.Joiner;
import com.google.gson.JsonObject;
import giovannimoretti.it.oetzi_words.utils.ConnectionDB;
import org.apache.commons.codec.binary.Base64;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SQL_Worker {

    private String host = "";
    private String username = "";
    private String password = "";
    Connection connectionDB;

    public SQL_Worker(String host, String username, String password) {
        this.host = host;
        this.username = username;
        this.password = password;
        newConnection();
    }

    public SQL_Worker(JsonObject config) {
        this.host = config.get("dbHost").getAsString();
        this.username = config.get("dbUser").getAsString();
        this.password = config.get("dbPassword").getAsString();
        newConnection();
    }

    private void newConnection() {
        connectionDB = ConnectionDB.getConnectionDB(this.host, this.username, this.password);
    }


    public Set<String> getImageMD5Pair() {
        Set<String> out = new HashSet<>();
        try {
            if (connectionDB.isClosed()) {
                newConnection();
            }
            PreparedStatement pstm = this.connectionDB.prepareStatement("select * from images");
            ResultSet results = pstm.executeQuery();
            while (results.next()) {
                out.add(results.getString("filename") + "_" + results.getString("md5"));
            }
            connectionDB.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out;
    }

    public void insertSingleImage(String filename, String md5, File img) throws SQLException, FileNotFoundException {
        String INSERT_PICTURE = "INSERT INTO images(filename, md5, image) VALUES (?, ?, ?)";
        if (connectionDB.isClosed()) {
            newConnection();
        }

        FileInputStream fis = new FileInputStream(img);
        PreparedStatement ps = connectionDB.prepareStatement(INSERT_PICTURE);
        ps.setString(1, filename);
        ps.setString(2, md5);
        ps.setBinaryStream(3, fis, (int) img.length());
        ps.executeUpdate();
        System.out.println("insert image " + filename + " " + md5);
    }


    public JsonObject lessTranscriptedImage(Set<Integer> skipImages) throws SQLException {
        if (connectionDB.isClosed()) {
            newConnection();
        }
        JsonObject output = new JsonObject();

        String query = "Select images.id as id, images.filename as filename , images.image as image ,count(game_results.id_image) as results from images left join game_results on images.id=game_results.id_image and images.id where images.id NOT IN (" + (skipImages.size() == 0 ? "0" : Joiner.on(",").join(skipImages)) + ") group by game_results.id_image, images.id order by results ASC LIMIT 1";
        PreparedStatement pstm = connectionDB.prepareStatement(query);

        ResultSet results = pstm.executeQuery();
        while (results.next()) {
            output.addProperty("id", results.getInt("id"));
            output.addProperty("filename", results.getString("filename"));

            Blob image = results.getBlob("image");
            byte[] blobAsBytes = image.getBytes(1, (int) image.length());
            String s = Base64.encodeBase64String(blobAsBytes);
            output.addProperty("image", s);


            image.free();
        }

        connectionDB.close();
        return output;
    }

    public List<String> getStoredTranscriptionOfImage(Integer imageId) throws SQLException {
        List<String> transcriptions = new ArrayList<>();
        if (connectionDB.isClosed()) {
            newConnection();
        }
        String query = "Select * from images , game_results where images.id=game_results.id_image and images.id = ?";
        PreparedStatement pstm = connectionDB.prepareStatement(query);
        pstm.setString(1, imageId.toString());
        ResultSet results = pstm.executeQuery();
        while (results.next()) {
            transcriptions.add(results.getString("transcription"));
        }
        connectionDB.close();
        return transcriptions;
    }


    public void insertTranscription(Integer imageId, String transcription, Integer gametime) throws SQLException, FileNotFoundException {
        String INSERT_TRANSCRIPTION = "INSERT INTO game_results(transcription, gametime, id_image) VALUES (?, ?, ?)";
        if (connectionDB.isClosed()) {
            newConnection();
        }

        PreparedStatement ps = connectionDB.prepareStatement(INSERT_TRANSCRIPTION);
        ps.setString(1, transcription);
        ps.setInt(2, gametime);
        ps.setInt(3, imageId);
        ps.executeUpdate();
    }
}

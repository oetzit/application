package giovannimoretti.it.oetzi_words.utils;

import java.sql.Connection;
import java.sql.DriverManager;


public class ConnectionDB {

    public static Connection getConnectionDB(String host,String username,String password){
        Connection con = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            con = DriverManager.getConnection(
                    "jdbc:mysql://" + host + ":3306/oetzi_words?Unicode=true&characterEncoding=UTF8&autoreconnect=true&cachePrepStmts=true&useServerPrepStmts=true&serverTimezone=UTC", username, password);

        }catch (Exception e){
            e.printStackTrace();
        }
        return con;
    }

}

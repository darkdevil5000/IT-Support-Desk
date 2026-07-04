package com.itdesk.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserSummary user;

    public JwtAuthenticationResponse(String accessToken, UserSummary user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserSummary {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String department;
    }
}

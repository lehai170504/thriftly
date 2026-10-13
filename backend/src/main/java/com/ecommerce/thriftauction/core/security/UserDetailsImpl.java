package com.ecommerce.thriftauction.core.security;

import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

/** Serializable, minimal principal safe to store in Redis-backed HTTP sessions. */
@JsonIgnoreProperties(ignoreUnknown = true)
public final class UserDetailsImpl implements UserDetails, CredentialsContainer, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final String id;
    private final String username;
    private final Role role;
    private final boolean active;
    private transient String password;

    public UserDetailsImpl(User user) {
        this.id = user.getId();
        this.username = user.getEmail();
        this.password = user.getPassword();
        this.role = user.getRole();
        this.active = user.isActive();
    }

    @JsonCreator
    public UserDetailsImpl(@JsonProperty("id") String id,
            @JsonProperty("username") String username,
            @JsonProperty("role") Role role,
            @JsonProperty("enabled") boolean active) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.active = active;
    }

    public String getId() {
        return id;
    }

    public Role getRole() {
        return role;
    }

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }

    @Override
    public void eraseCredentials() {
        password = null;
    }
}
